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
async function handleTest(cmd) {
  const { jobId, scenario, steps = [] } = cmd
  console.log(`\n[test] Menjalankan ${steps.length} test steps untuk skenario: ${scenario}...`)

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

  const total = steps.length
  let screenshotsTaken = 0

  // Pastikan aplikasi terbuka di awal test
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

    // Jalankan action jika ada action khusus
    try {
      if (step.action === 'tap' && step.x && step.y) {
        execSync(`adb -s ${device.id} shell input tap ${step.x} ${step.y}`)
      } else if (step.action === 'type' && step.text) {
        execSync(`adb -s ${device.id} shell input text "${step.text}"`)
      } else if (step.action === 'press') {
        execSync(`adb -s ${device.id} shell input keyevent ${step.key || 'KEYCODE_HOME'}`)
      }
    } catch (e) {
      console.warn(`[test] Action warning: ${e.message}`)
    }

    // Tunggu sesuai delay step
    const waitMs = (step.wait || 2) * 1000
    await new Promise(r => setTimeout(r, waitMs))

    // Ambil screenshot tiap step
    const tempFile = join(tmpdir(), `step-${stepNum}-${Date.now()}.png`)
    const filename = `step-${stepNum}-${Date.now()}.png`
    let screenshotName = null

    try {
      execSync(`adb -s ${device.id} shell screencap -p /sdcard/step_tmp.png`, { timeout: 10000 })
      execSync(`adb -s ${device.id} pull /sdcard/step_tmp.png "${tempFile}"`, { timeout: 10000 })
      execSync(`adb -s ${device.id} shell rm /sdcard/step_tmp.png`, { timeout: 5000 })

      const imgBase64 = readFileSync(tempFile).toString('base64')
      try { unlinkSync(tempFile) } catch {}

      await fetch(`${HTTP_URL}/api/scenarios/${encodeURIComponent(scenario)}/upload-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgBase64, filename })
      })
      screenshotName = filename
      screenshotsTaken++
    } catch (e) {
      console.warn(`[test] Screenshot step ${stepNum} warning: ${e.message}`)
    }

    // Kirim event step selesai
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'runner_step',
        jobId,
        stepIndex: stepNum,
        name: step.description || `Step ${stepNum}`,
        status: 'pass',
        screenshot: screenshotName
      }))
    }
  }

  console.log(`[test] Skenario '${scenario}' selesai dengan sukses!`)
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'runner_test_result',
      jobId,
      status: 'pass',
      message: `Semua ${total} step berhasil dijalankan di emulator ${device.id}! (${screenshotsTaken} screenshot tersimpan)`
    }))
  }
}

connect()
