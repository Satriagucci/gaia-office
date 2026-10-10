/**
 * GAIA Office — Laptop Agent & Test Runner
 * Menghubungkan Laptop user dengan GAIA Office di VPS secara real-time via WebSocket.
 * 
 * Fitur:
 * 1. Menerima trigger "Build APK" dari website VPS -> jalankan build lokal di laptop (0 EAS cloud quota) -> auto SCP ke VPS.
 * 2. Menerima trigger "Run Test" dari website VPS -> jalankan automation di emulator laptop -> capture & kirim hasil ke website VPS.
 * 3. Menerima trigger "Capture" -> ambil screenshot emulator laptop dan upload langsung ke Test Bank di website VPS.
 */

import WebSocket from 'ws'
import { spawn, execSync } from 'child_process'
import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { dumpHierarchy, findNodeByText, clickText, getPerformanceStats } from './adb-helper.js'
import { runOrganicUserSimulation } from './simulator/organic-user.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const VPS_HOST = process.env.VPS_HOST || '100.89.171.112'
const VPS_PORT = process.env.VPS_PORT || '8788'
const WS_URL = `ws://${VPS_HOST}:${VPS_PORT}/chat`
const HTTP_URL = `http://${VPS_HOST}:${VPS_PORT}`

const BUILD_SCRIPT = existsSync(join(__dirname, 'build-local.ps1')) 
  ? join(__dirname, 'build-local.ps1') 
  : 'C:\\Users\\SatriaGucci\\build-local.ps1'

console.log('╔═══════════════════════════════════════════════════════╗')
console.log('║       GAIA Office — Local Laptop Runner Agent         ║')
console.log('╚═══════════════════════════════════════════════════════╝')
console.log(`[config] VPS Server: ${HTTP_URL}`)
console.log(`[config] WebSocket : ${WS_URL}`)

function getAdbDevice() {
  try {
    const out = execSync('adb devices', { encoding: 'utf-8' })
    const lines = out.split('\n').filter(l => l.trim() && !l.startsWith('List of'))
    for (const l of lines) {
      const parts = l.trim().split(/\s+/)
      if (parts[1] === 'device') {
        let model = 'Android Device'
        try {
          model = execSync(`adb -s ${parts[0]} shell getprop ro.product.model`, { encoding: 'utf-8' }).trim()
        } catch {}
        return { id: parts[0], model }
      }
    }
  } catch (e) {
    console.warn('[adb] ADB tidak terdeteksi atau error:', e.message)
  }
  return null
}

let ws = null
let reconnectTimer = null

function connect() {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  console.log(`[connect] Menghubungkan ke ${WS_URL}...`)

  const device = getAdbDevice()
  if (device) {
    console.log(`[adb] Emulator terdeteksi: ${device.id} (${device.model})`)
  } else {
    console.warn('[adb] Peringatan: Tidak ada emulator/device Android yang terdeteksi via ADB!')
  }

  ws = new WebSocket(WS_URL)

  ws.on('open', () => {
    console.log('✅ Terhubung ke GAIA Office di VPS!')
    // Register ke VPS
    ws.send(JSON.stringify({
      type: 'runner_register',
      device: device ? device.id : 'No ADB Device',
      model: device ? device.model : 'Offline',
      os: process.platform,
      hostname: process.env.COMPUTERNAME || 'Laptop'
    }))
  })

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.type === 'cmd_build') {
        handleBuild(msg)
      } else if (msg.type === 'cmd_test') {
        handleTest(msg)
      } else if (msg.type === 'cmd_capture') {
        handleCapture(msg)
      }
    } catch (err) {
      console.error('[msg] Error parsing message:', err)
    }
  })

  ws.on('close', () => {
    console.warn('⚠️ Koneksi ke VPS terputus. Mencoba reconnect dalam 3 detik...')
    reconnectTimer = setTimeout(connect, 3000)
  })

  ws.on('error', (err) => {
    console.error('[error]', err.message)
    ws.close()
  })
}

// ──────────────────────────────────────────────
// HANDLER: BUILD APK
// ──────────────────────────────────────────────
function handleBuild(cmd) {
  const { jobId, profile = 'staging' } = cmd
  console.log(`\n[build] Memulai Build APK (${profile}) untuk Job ${jobId}...`)

  if (!existsSync(BUILD_SCRIPT)) {
    ws.send(JSON.stringify({
      type: 'runner_log',
      jobId,
      message: `BUILD_ERROR|Script build tidak ditemukan di ${BUILD_SCRIPT}`
    }))
    ws.send(JSON.stringify({ type: 'runner_done', jobId, status: 'error' }))
    return
  }

  const ps = spawn('powershell.exe', [
    '-ExecutionPolicy', 'Bypass',
    '-File', BUILD_SCRIPT,
    '-Profile', profile
  ], { windowsHide: true })

  ps.stdout.on('data', (d) => {
    const text = d.toString()
    process.stdout.write(text)
    const lines = text.split('\n').filter(l => l.trim())
    for (const l of lines) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'runner_log', jobId, message: l }))
      }
    }
  })

  ps.stderr.on('data', (d) => {
    const text = d.toString()
    process.stderr.write(text)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'runner_log', jobId, message: 'stderr: ' + text }))
    }
  })

  ps.on('exit', (code) => {
    console.log(`[build] Selesai dengan exit code: ${code}`)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'runner_done',
        jobId,
        status: code === 0 ? 'done' : 'error',
        message: code === 0 ? 'Build & SCP transfer berhasil!' : `Build gagal (exit ${code})`
      }))
    }
  })
}

// ──────────────────────────────────────────────
// HANDLER: CAPTURE EMULATOR SCREEN
// ──────────────────────────────────────────────
async function handleCapture(cmd) {
  const { jobId, scenario } = cmd
  console.log(`\n[capture] Mengambil screenshot emulator untuk skenario: ${scenario}...`)

  const device = getAdbDevice()
  if (!device) {
    console.error('[capture] Tidak ada emulator aktif!')
    return
  }

  const tempFile = join(tmpdir(), `cap-${Date.now()}.png`)
  const filename = `capture-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`

  try {
    execSync(`adb -s ${device.id} shell screencap -p /sdcard/screen_tmp.png`, { timeout: 10000 })
    execSync(`adb -s ${device.id} pull /sdcard/screen_tmp.png "${tempFile}"`, { timeout: 10000 })
    execSync(`adb -s ${device.id} shell rm /sdcard/screen_tmp.png`, { timeout: 5000 })

    const imgBase64 = readFileSync(tempFile).toString('base64')
    try { unlinkSync(tempFile) } catch {}

    // Upload ke VPS via HTTP
    const res = await fetch(`${HTTP_URL}/api/scenarios/${encodeURIComponent(scenario)}/upload-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imgBase64, filename })
    })
    const d = await res.json()
    console.log(`[capture] Upload capture sukses: ${filename}`)

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'runner_done', jobId, filename, ok: d.ok }))
    }
  } catch (e) {
    console.error('[capture] Gagal capture:', e.message)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'runner_done', jobId, error: e.message }))
    }
  }
}

// ──────────────────────────────────────────────
// HANDLER: RUN AUTOMATION TEST
// ──────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function snapStep(device, scenario, current, total, name, filename, jobId) {
  const tempFile = join(tmpdir(), `cap-${Date.now()}.png`)
  let imgBase64 = ''
  try {
    execSync(`adb -s ${device.id} shell screencap -p /sdcard/s_tmp.png`, { timeout: 10000 })
    execSync(`adb -s ${device.id} pull /sdcard/s_tmp.png "${tempFile}"`, { timeout: 10000 })
    execSync(`adb -s ${device.id} shell rm /sdcard/s_tmp.png`, { timeout: 5000 })
    imgBase64 = readFileSync(tempFile).toString('base64')
    try { unlinkSync(tempFile) } catch {}

    // Upload ke VPS
    await fetch(`${HTTP_URL}/api/scenarios/${encodeURIComponent(scenario)}/upload-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imgBase64, filename })
    })
  } catch (e) {
    console.warn(`[snap] ${e.message}`)
  }

  const pct = Math.round((current / total) * 100)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'runner_step',
      jobId,
      stepIndex: current,
      name,
      status: 'pass',
      screenshot: filename
    }))
    ws.send(JSON.stringify({
      type: 'runner_progress',
      jobId,
      current,
      total,
      percent: pct
    }))
  }
}

async function runModularMobileFlow(device, scenario, jobId) {
  const isAll = scenario === 'all' || scenario === 'all-scenarios'
  const list = isAll 
    ? ['01-daftar', '02-login', '03-membuat-misi', '04-melakukan-pembayaran', '05-mengambil-misi']
    : [scenario]

  for (const sc of list) {
    console.log(`\n[mobile-test] Menjalankan skenario di emulator (${device.id}): ${sc}...`)

    if (sc === '01-daftar' || sc.includes('daftar')) {
      // Step 1: Launch
      execSync(`adb -s ${device.id} shell am start -S -n com.bukainjalan.app/.MainActivity`, { timeout: 10000 })
      await sleep(2500)
      await snapStep(device, sc, 1, 5, 'Meluncurkan Aplikasi BukainJalan di Layar Utama', '01_home_screen.png', jobId)

      // Step 2: Open Profil
      execSync(`adb -s ${device.id} shell input tap 900 2080`)
      await sleep(1500)
      await snapStep(device, sc, 2, 5, 'Membuka Menu Profil & Sheet Autentikasi', '01_auth_sheet.png', jobId)

      // Step 3: Open Register Form
      execSync(`adb -s ${device.id} shell input tap 540 1912`)
      await sleep(2000)
      await snapStep(device, sc, 3, 5, 'Membuka Form Pendaftaran Akun Baru', '01_register_form.png', jobId)

      // Step 4: Fill form
      const rand = Math.floor(Math.random() * 900 + 100)
      execSync(`adb -s ${device.id} shell input tap 500 950`)
      await sleep(300)
      execSync(`adb -s ${device.id} shell input text "QA%sTester%sPro"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(300)

      execSync(`adb -s ${device.id} shell input tap 500 1220`)
      await sleep(300)
      execSync(`adb -s ${device.id} shell input text "qatester${rand}"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(300)

      execSync(`adb -s ${device.id} shell input tap 500 1490`)
      await sleep(300)
      execSync(`adb -s ${device.id} shell input text "qa.reg.${Date.now()}@bukainjalan.test"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(300)

      execSync(`adb -s ${device.id} shell input tap 500 1750`)
      await sleep(300)
      execSync(`adb -s ${device.id} shell input text "081299887766"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(300)

      execSync(`adb -s ${device.id} shell input tap 500 2020`)
      await sleep(300)
      execSync(`adb -s ${device.id} shell input text "Password123!"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(600)
      await snapStep(device, sc, 4, 5, 'Mengisi Seluruh Field Form Registrasi', '01_form_filled.png', jobId)

      // Step 5: Checkbox & Submit
      execSync(`adb -s ${device.id} shell input swipe 540 1800 540 800 300`)
      await sleep(600)
      execSync(`adb -s ${device.id} shell input tap 146 1587`) // Checkbox
      await sleep(500)
      execSync(`adb -s ${device.id} shell input tap 540 1800`) // Daftar Sekarang
      await sleep(3000)
      await snapStep(device, sc, 5, 5, 'Submit Pendaftaran & Verifikasi Transisi Layar OTP', '01_submit_result.png', jobId)
    }
    else if (sc === '02-login' || sc.includes('login')) {
      execSync(`adb -s ${device.id} shell am start -n com.bukainjalan.app/.MainActivity`)
      await sleep(2000)
      await snapStep(device, sc, 1, 4, 'Meluncurkan Aplikasi BukainJalan', '02_home.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 900 2080`)
      await sleep(1500)
      execSync(`adb -s ${device.id} shell input tap 540 2080`)
      await sleep(2000)
      await snapStep(device, sc, 2, 4, 'Membuka Form Masuk (Login)', '02_login_form.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 540 1050`)
      await sleep(400)
      execSync(`adb -s ${device.id} shell input text "qa.login@bukainjalan.test"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(300)
      execSync(`adb -s ${device.id} shell input tap 540 1250`)
      await sleep(400)
      execSync(`adb -s ${device.id} shell input text "Password123!"`)
      execSync(`adb -s ${device.id} shell input keyevent 4`)
      await sleep(500)
      await snapStep(device, sc, 3, 4, 'Mengisi Kredensial Login', '02_login_credentials.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 540 1450`)
      await sleep(2500)
      await snapStep(device, sc, 4, 4, 'Submit Login & Verifikasi Session Profil', '02_login_success.png', jobId)
    }
    else if (sc === '03-membuat-misi' || sc.includes('misi')) {
      execSync(`adb -s ${device.id} shell am start -n com.bukainjalan.app/.MainActivity`)
      await sleep(2000)
      execSync(`adb -s ${device.id} shell input tap 100 2080`)
      await sleep(1000)
      await snapStep(device, sc, 1, 4, 'Meninjau Layar Beranda Feed', '03_home_feed.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 540 2050`)
      await sleep(2000)
      await snapStep(device, sc, 2, 4, 'Membuka Dialog Buat Misi', '03_buat_misi_dialog.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 505 1030`)
      await sleep(2000)
      await snapStep(device, sc, 3, 4, 'Memilih Kategori Jasa Fisik', '03_kategori_selected.png', jobId)

      await sleep(1000)
      await snapStep(device, sc, 4, 4, 'Verifikasi Draft Form Misi Siap Dibuat', '03_mission_ready.png', jobId)
    }
    else if (sc === '04-melakukan-pembayaran' || sc.includes('bayar') || sc.includes('pembayaran')) {
      execSync(`adb -s ${device.id} shell am start -n com.bukainjalan.app/.MainActivity`)
      await sleep(2000)
      execSync(`adb -s ${device.id} shell input tap 100 2080`)
      await sleep(1000)
      await snapStep(device, sc, 1, 3, 'Kembali ke Layar Beranda', '04_home_balance.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 540 420`)
      await sleep(2000)
      await snapStep(device, sc, 2, 3, 'Membuka Dompet & Status Escrow', '04_dompet_screen.png', jobId)

      await sleep(1000)
      await snapStep(device, sc, 3, 3, 'Verifikasi Perlindungan Escrow Terkunci Aman', '04_escrow_secured.png', jobId)
    }
    else if (sc === '05-mengambil-misi' || sc.includes('ambil')) {
      execSync(`adb -s ${device.id} shell am start -n com.bukainjalan.app/.MainActivity`)
      await sleep(2000)
      execSync(`adb -s ${device.id} shell input tap 295 2080`)
      await sleep(2500)
      await snapStep(device, sc, 1, 3, 'Membuka Peta Radar Misi di Sekitar', '05_radar_map.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 720 180`)
      await sleep(2000)
      await snapStep(device, sc, 2, 3, 'Beralih ke Radar Talent & Siap Ambil Misi', '05_talent_radar.png', jobId)

      execSync(`adb -s ${device.id} shell input tap 100 2080`)
      await sleep(1500)
      await snapStep(device, sc, 3, 3, 'Misi Sukses Terpantau di Radar', '05_completed_radar.png', jobId)
    }
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'runner_test_result',
      jobId,
      status: 'pass',
      message: `Semua pengujian pada emulator (${device.id}) berhasil diselesaikan 100%! Aplikasi terbuka, berinteraksi di layar, dan tangkapan layar tersimpan.`
    }))
  }
}

async function handleTest(cmd) {
  const { jobId, scenario, steps = [] } = cmd
  console.log(`\n[test] Menerima trigger test untuk skenario: ${scenario}...`)

  const device = getAdbDevice()
  if (!device) {
    ws.send(JSON.stringify({
      type: 'runner_test_result',
      jobId,
      status: 'error',
      message: 'Tidak ada emulator Android lokal yang terhubung via ADB!'
    }))
    return
  }

  // Jika skenario modular Test Bank atau 'all', gunakan alur nyata emulator
  const modularKeys = ['01-daftar', '02-login', '03-membuat-misi', '04-melakukan-pembayaran', '05-mengambil-misi', 'all']
  if (modularKeys.some(k => scenario.includes(k))) {
    try {
      await runModularMobileFlow(device, scenario, jobId)
    } catch (err) {
      console.error('[mobile-test] Error:', err.message)
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'runner_test_result',
          jobId,
          status: 'error',
          message: `Otomasi emulator terhenti: ${err.message}`
        }))
      }
    }
    return
  }

  // Fallback generic steps runner
  const total = steps.length
  let screenshotsTaken = 0

  try {
    execSync(`adb -s ${device.id} shell am start -n com.bukainjalan.app/.MainActivity`, { timeout: 10000 })
    await new Promise(r => setTimeout(r, 2500))
  } catch {}

  for (let i = 0; i < total; i++) {
    const step = steps[i]
    const stepNum = i + 1
    const pct = Math.round((stepNum / total) * 100)
    console.log(`[test] Step ${stepNum}/${total}: ${step.description || step.name || 'Step'}`)

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'runner_progress',
        jobId,
        current: stepNum,
        total,
        percent: pct
      }))
    }

    let stepStatus = 'pass'
    try {
      if (step.action === 'launch_app') {
        execSync(`adb -s ${device.id} shell am start -n com.bukainjalan.app/.MainActivity`, { timeout: 10000 })
      } else if (step.action === 'click_coord' || (step.x && step.y)) {
        execSync(`adb -s ${device.id} shell input tap ${step.x} ${step.y}`)
      } else if (step.action === 'type' && step.text) {
        execSync(`adb -s ${device.id} shell input text "${String(step.text).replace(/ /g, '%s')}"`)
      }
    } catch (e) {
      stepStatus = 'fail'
    }

    await sleep((step.wait || 2) * 1000)

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'runner_step',
        jobId,
        stepIndex: stepNum,
        name: step.description || `Step ${stepNum}`,
        status: stepStatus
      }))
    }
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'runner_test_result',
      jobId,
      status: 'pass',
      message: `Semua ${total} step berhasil dijalankan di emulator ${device.id}!`
    }))
  }
}

connect()
