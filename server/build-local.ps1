param(
    [string]$Profile = "staging",
    [string]$ProjectDir = "",
    [string]$ApkOutput = "D:\bukainjalan-apks",
    [string]$VpsHost = "76.13.21.10",
    [int]$VpsPort = 2222,
    [string]$VpsUser = "deploy",
    [string]$SshKey = "$env:USERPROFILE\.ssh\id_ed25519",
    [string]$ContainerName = "hermes-agent",
    [string]$RemoteDir = "/home/hermes/gaia-vault/gaia-office/public/apks",
    [switch]$SkipBuild,
    [switch]$AutoInstall
)

function Write-BuildLog {
    param([string]$Type, [string]$Message)
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Output "[$ts] $Type|$Message"
}

# 1. Tentukan ProjectDir
if (-not $ProjectDir) {
    if (Test-Path "c:\Users\SatriaGucci\Development\bukainjalan_app\bukainjalan_mobile") {
        $ProjectDir = "c:\Users\SatriaGucci\Development\bukainjalan_app\bukainjalan_mobile"
    } elseif (Test-Path "D:\actions-runner\_work\mobile\mobile") {
        $ProjectDir = "D:\actions-runner\_work\mobile\mobile"
    } else {
        $ProjectDir = (Get-Location).Path
    }
}

Write-BuildLog "BUILD_LOG" "Project directory: $ProjectDir"
Write-BuildLog "BUILD_LOG" "Memulai local build dengan profile: $Profile"

# 2. Buat folder output
if (-not (Test-Path $ApkOutput)) {
    New-Item -ItemType Directory -Path $ApkOutput -Force | Out-Null
}

$apkFile = $null

if (-not $SkipBuild) {
    # 3. Pindah ke project
    Set-Location $ProjectDir

    # 4. Native Expo Gradle Pipeline (Direct, 0 EAS wait, isolated cache)
    if (-not (Test-Path "$ProjectDir\android")) {
        Write-BuildLog "BUILD_LOG" "Menjalankan npx expo prebuild --platform android..."
        npx -y expo prebuild --platform android 2>&1 | ForEach-Object {
            Write-BuildLog "BUILD_RAW" $_
        }
    }

    if (Test-Path "$ProjectDir\android\gradlew.bat") {
        Write-BuildLog "BUILD_LOG" "Membersihkan cache C++ (.cxx) lama agar tidak terjadi loop dirty build.ninja..."
        Remove-Item -Recurse -Force "$ProjectDir\android\.cxx", "$ProjectDir\android\app\.cxx" -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force "$ProjectDir\node_modules\react-native-reanimated\android\.cxx", "$ProjectDir\node_modules\react-native-screens\android\.cxx", "$ProjectDir\node_modules\react-native-gesture-handler\android\.cxx", "$ProjectDir\node_modules\react-native-worklets\android\.cxx", "$ProjectDir\node_modules\expo-modules-core\android\.cxx", "$ProjectDir\node_modules\expo-updates\android\.cxx" -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force "$ProjectDir\node_modules\react-native-reanimated\android\build", "$ProjectDir\node_modules\react-native-screens\android\build" -ErrorAction SilentlyContinue

        # Gunakan direktori cache build terisolasi (.gradle_build) agar tidak berbenturan lock dengan IDE / Java Language Server
        Remove-Item -Recurse -Force "$ProjectDir\android\.gradle_build" -ErrorAction SilentlyContinue

        Write-BuildLog "BUILD_LOG" "Kompilasi APK via Gradle assembleRelease (isolated cache)..."
        Push-Location "$ProjectDir\android"
        .\gradlew.bat assembleRelease --project-cache-dir "$ProjectDir\android\.gradle_build" 2>&1 | ForEach-Object {
            Write-BuildLog "BUILD_RAW" $_
        }
        $buildExit = $LASTEXITCODE
        Pop-Location
    } else {
            Write-BuildLog "BUILD_LOG" "Menjalankan npx expo run:android --variant release..."
            npx -y expo run:android --variant release 2>&1 | ForEach-Object {
                Write-BuildLog "BUILD_RAW" $_
            }
            $buildExit = $LASTEXITCODE
        }

        $apkCandidate = Get-ChildItem -Path "$ProjectDir\android\app\build\outputs\apk" -Recurse -Filter "*.apk" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($apkCandidate) {
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $version = "local"
            try {
                $config = Get-Content "$ProjectDir\app.config.js" -Raw -ErrorAction SilentlyContinue
                $match = [regex]::Match($config, 'version:\s*"([^"]+)"')
                if ($match.Success) { $version = $match.Groups[1].Value }
            } catch {}
            $destName = "bukainjalan-$version-$timestamp.apk"
            Copy-Item $apkCandidate.FullName "$ApkOutput\$destName" -Force
            $apkFile = Get-Item "$ApkOutput\$destName"
            Write-BuildLog "BUILD_DONE" "APK berhasil dikompilasi: $destName"
        } elseif ($buildExit -ne 0) {
            Write-BuildLog "BUILD_ERROR" "Kompilasi gagal (exit $buildExit)."
            exit 1
        }
    }

# 5. Cari APK terbaru di folder output jika belum diset
if (-not $apkFile) {
    $apkCandidate = Get-ChildItem -Path $ApkOutput -Recurse -Filter "*.apk" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($apkCandidate) {
        $apkFile = $apkCandidate
    } else {
        Write-BuildLog "BUILD_ERROR" "Tidak ditemukan file APK di $ApkOutput"
        exit 1
    }
}

$sizeMb = [math]::Round($apkFile.Length / 1MB, 2)
$fileName = $apkFile.Name
Write-BuildLog "BUILD_DONE" "APK siap: $($apkFile.FullName) ($sizeMb MB)"

# 6. AUTO-TRANSFER APK DARI LAPTOP LANGSUNG KE VPS (SCP)
Write-BuildLog "BUILD_TRANSFER" "Memulai auto-transfer SCP ke VPS (${VpsHost}:${VpsPort})..."

# Fast TCP Ping (1.5 detik timeout)
$sshTargetHost = $VpsHost
$sshTargetPort = $VpsPort
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $ar = $tcp.BeginConnect($VpsHost, $VpsPort, $null, $null)
    $portOk = $ar.AsyncWaitHandle.WaitOne(1500)
    if ($portOk) { $tcp.EndConnect($ar) }
    $tcp.Close()
    if (-not $portOk) { throw "Timeout" }
} catch {
    Write-BuildLog "BUILD_WARN" "Port $VpsPort di $VpsHost tidak merespon, fallback ke Tailscale 100.110.218.117:22..."
    $sshTargetHost = "100.110.218.117"
    $sshTargetPort = 22
}

$remoteTempPath = "/tmp/$fileName"
Write-BuildLog "BUILD_TRANSFER" "Mengirim file via SCP ke ${VpsUser}@${sshTargetHost}:${remoteTempPath}"

$targetScp = "${VpsUser}@${sshTargetHost}:${remoteTempPath}"
$scpArgs = @(
    "-P", "$sshTargetPort",
    "-i", "$SshKey",
    "-o", "StrictHostKeyChecking=no",
    "-o", "ConnectTimeout=15",
    "$($apkFile.FullName)",
    "$targetScp"
)

& scp @scpArgs 2>&1 | ForEach-Object { Write-BuildLog "SCP" $_ }

if ($LASTEXITCODE -ne 0) {
    Write-BuildLog "BUILD_ERROR" "SCP transfer gagal dengan exit code $LASTEXITCODE"
    exit 1
}

Write-BuildLog "BUILD_TRANSFER" "File berhasil di-upload ke host VPS. Memindahkan ke container $ContainerName..."

# Pindahkan file dari VPS host ke dalam container docker hermes-agent
$targetSshHost = "${VpsUser}@${sshTargetHost}"
$dockerCpCmd = "docker cp $remoteTempPath ${ContainerName}:${RemoteDir}/$fileName && rm -f $remoteTempPath"
$sshArgs = @(
    "-p", "$sshTargetPort",
    "-i", "$SshKey",
    "-o", "StrictHostKeyChecking=no",
    "-o", "ConnectTimeout=15",
    "$targetSshHost",
    $dockerCpCmd
)

& ssh @sshArgs 2>&1 | ForEach-Object { Write-BuildLog "SSH" $_ }

Write-BuildLog "BUILD_TRANSFER_DONE" "APK $fileName sukses masuk ke ${ContainerName}:${RemoteDir}"

# 7. OPSIONAL: AUTO-INSTALL KE EMULATOR ANDROID DI VPS
if ($AutoInstall) {
    Write-BuildLog "BUILD_INSTALL" "Memasang APK ke emulator Android di VPS..."
    $installCmd = "docker exec $ContainerName /home/hermes/platform-tools/adb -s localhost:5555 install -r ${RemoteDir}/$fileName && docker exec $ContainerName /home/hermes/platform-tools/adb -s localhost:5555 shell am start -n com.bukainjalan.app/.MainActivity"
    $sshInstallArgs = @(
        "-p", "$sshTargetPort",
        "-i", "$SshKey",
        "-o", "StrictHostKeyChecking=no",
        "-o", "ConnectTimeout=15",
        "$targetSshHost",
        $installCmd
    )
    & ssh @sshInstallArgs 2>&1 | ForEach-Object { Write-BuildLog "ADB" $_ }
    Write-BuildLog "BUILD_INSTALLED" "APK terinstall dan aplikasi diluncurkan di emulator!"
}

Write-BuildLog "PIPELINE_COMPLETE" "Pipeline selesai 100%! APK tersedia di GAIA Office."
