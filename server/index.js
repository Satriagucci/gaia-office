import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync, rmSync } from 'fs'
import { homedir } from 'os'
import { dirname, join } from 'path'
import { randomBytes } from 'crypto'
import { renderDashboardView, renderApksView, renderTestBankView, renderScenarioDetailView } from './views.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const SCREENSHOTS_DIR = join(__dirname, '..', 'public', 'screenshots')
const APK_DIR = join(__dirname, '..', 'public', 'apks')
const DIST_DIR = join(__dirname, '..', 'dist')
const AUTH_TOKEN = process.env.AUTH_TOKEN || randomBytes(16).toString('hex')

mkdirSync(SCREENSHOTS_DIR, { recursive: true })
mkdirSync(APK_DIR, { recursive: true })

// Serve static assets for Virtual Office & public files
if (existsSync(DIST_DIR)) {
  app.use('/assets', express.static(join(DIST_DIR, 'assets')))
  app.use('/sprites', express.static(join(DIST_DIR, 'sprites')))
  app.use('/rooms', express.static(join(DIST_DIR, 'rooms')))
  app.get('/office', (_req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'))
  })
}
app.use(express.static(join(__dirname, '..', 'public')))

// ──────────────────────────────────────────────
// RUNNER STATE & DISPATCHER
// ──────────────────────────────────────────────
let activeRunner = null // { ws, id, device, model, lastSeen }
const activeJobs = new Map() // jobId -> handlers

// ── BUILD HISTORY & PERSISTENCE ──
const DATA_DIR = join(__dirname, '..', 'data')
const BUILDS_FILE = join(DATA_DIR, 'builds.json')
const BUILD_LOGS_DIR = join(DATA_DIR, 'build-logs')

try { mkdirSync(DATA_DIR, { recursive: true }) } catch {}
try { mkdirSync(BUILD_LOGS_DIR, { recursive: true }) } catch {}

function loadBuildHistory() {
  try {
    if (existsSync(BUILDS_FILE)) {
      const data = JSON.parse(readFileSync(BUILDS_FILE, 'utf-8'))
      if (Array.isArray(data)) return data
    }
  } catch {}
  return []
}

function saveBuildRecord(record) {
  try {
    const list = loadBuildHistory()
    const idx = list.findIndex(b => (b.id && b.id === record.id) || (b.jobId && b.jobId === record.jobId))
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record }
    } else {
      list.unshift(record)
    }
    if (list.length > 50) list.length = 50
    writeFileSync(BUILDS_FILE, JSON.stringify(list, null, 2), 'utf-8')
  } catch (e) {
    console.error('saveBuildRecord error:', e.message)
  }
}

// ── PERSISTENT BUILD PIPELINE STATE ──
const currentBuild = {
  active: false,
  id: null,
  jobId: null,
  profile: 'staging',
  target: 'laptop',
  node: 'Laptop-Satria',
  startTime: null,
  endTime: null,
  status: 'idle', // 'idle' | 'running' | 'success' | 'failed'
  stage: 'init',
  stageTimes: { init: null, config: null, compile: null, transfer: null, deploy: null },
  progressPct: 0,
  statusText: '',
  logs: [],
  clients: new Set(),
}

function updateBuildTelemetry(text) {
  const lower = text.toLowerCase()
  if (lower.includes('project directory') || lower.includes('memulai local build')) {
    currentBuild.stage = 'config'
    currentBuild.stageTimes.init = '2s'
    currentBuild.progressPct = Math.max(currentBuild.progressPct, 20)
    currentBuild.statusText = 'Stage 2/5: Konfigurasi project & dependensi...'
  } else if (
    lower.includes('eas build') ||
    lower.includes('expo run') ||
    lower.includes('gradle') ||
    lower.includes('assemblerelease') ||
    lower.includes('compile') ||
    lower.includes('task :') ||
    lower.includes('daemon')
  ) {
    currentBuild.stage = 'compile'
    currentBuild.stageTimes.config = '4s'
    currentBuild.progressPct = Math.max(currentBuild.progressPct, 45)
    currentBuild.statusText = 'Stage 3/5: Mengompilasi APK secara lokal (Gradle & Kotlin)...'
    if (lower.includes('compilereleasejava') || lower.includes('packagerelease') || lower.includes('assemblerelease')) {
      currentBuild.progressPct = Math.max(currentBuild.progressPct, 75)
    }
  } else if (lower.includes('build_transfer') || lower.includes('scp') || lower.includes('transfer')) {
    currentBuild.stage = 'transfer'
    currentBuild.stageTimes.compile = 'ok'
    currentBuild.progressPct = Math.max(currentBuild.progressPct, 85)
    currentBuild.statusText = 'Stage 4/5: Mentransfer APK ke VPS (deploy@76.13.21.10)...'
  } else if (text.includes('BUILD_DONE') || lower.includes('selesai') || text.includes('PIPELINE_COMPLETE')) {
    currentBuild.stage = 'deploy'
    currentBuild.stageTimes.transfer = 'ok'
    currentBuild.stageTimes.deploy = 'ok'
    currentBuild.progressPct = 100
    currentBuild.statusText = '✓ Pipeline Selesai! APK siap dipakai.'
    currentBuild.status = 'success'
    currentBuild.active = false
    currentBuild.endTime = Date.now()

    const durationSec = Math.round((currentBuild.endTime - (currentBuild.startTime || currentBuild.endTime)) / 1000)
    let latestApk = null
    try {
      const apks = readdirSync(APK_DIR)
        .filter(f => f.endsWith('.apk'))
        .map(f => ({ file: f, size: statSync(join(APK_DIR, f)).size, time: statSync(join(APK_DIR, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time)
      if (apks.length > 0) latestApk = apks[0]
    } catch {}

    saveBuildRecord({
      id: currentBuild.id || 1,
      jobId: currentBuild.jobId,
      profile: currentBuild.profile,
      target: currentBuild.target,
      node: currentBuild.node,
      status: 'SUCCESS',
      weather: '☀️',
      startTime: currentBuild.startTime,
      endTime: currentBuild.endTime,
      durationSec,
      stageTimes: currentBuild.stageTimes,
      apkFile: latestApk?.file || null,
      apkSize: latestApk?.size || null,
      errorReason: null,
      logs: currentBuild.logs.slice(-200)
    })

    try {
      writeFileSync(join(BUILD_LOGS_DIR, `${currentBuild.jobId}.log`), currentBuild.logs.join('\n'), 'utf-8')
    } catch {}
  } else if (text.includes('BUILD_ERROR') || lower.includes('gagal') || lower.includes('ninja: build stopped') || lower.includes('cmake... failed')) {
    currentBuild.statusText = '✕ Pipeline Gagal: ' + text.replace(/.*BUILD_ERROR\|/, '')
    currentBuild.status = 'failed'
    currentBuild.active = false
    currentBuild.endTime = Date.now()

    const durationSec = Math.round((currentBuild.endTime - (currentBuild.startTime || currentBuild.endTime)) / 1000)
    saveBuildRecord({
      id: currentBuild.id || 1,
      jobId: currentBuild.jobId,
      profile: currentBuild.profile,
      target: currentBuild.target,
      node: currentBuild.node,
      status: 'FAILED',
      weather: '🌧️',
      startTime: currentBuild.startTime,
      endTime: currentBuild.endTime,
      durationSec,
      stageTimes: currentBuild.stageTimes,
      apkFile: null,
      apkSize: null,
      errorReason: text.replace(/.*BUILD_ERROR\|/, ''),
      logs: currentBuild.logs.slice(-200)
    })

    try {
      writeFileSync(join(BUILD_LOGS_DIR, `${currentBuild.jobId}.log`), currentBuild.logs.join('\n'), 'utf-8')
    } catch {}
  }
}


function parseMdSteps(content) {
  if (!content) return []
  const stepsMatch = content.match(/## Steps\n([\s\S]*?)(?:\n## |$)/)
  if (!stepsMatch) return []
  const lines = stepsMatch[1].trim().split('\n')
  const steps = []
  for (const l of lines) {
    const trimmed = l.trim()
    if (trimmed && /^\d+\./.test(trimmed)) {
      const stepText = trimmed.replace(/^\d+\.\s*/, '')
      steps.push({ action: 'screenshot', description: stepText, wait: 2 })
    }
  }
  return steps
}

// ──────────────────────────────────────────────
// TEST BANK & RUNNER PIPELINE
// ──────────────────────────────────────────────

function listScenarios() {
  try {
    return readdirSync(SCREENSHOTS_DIR)
      .filter(f => statSync(join(SCREENSHOTS_DIR, f)).isDirectory() && !f.startsWith('.'))
      .sort()
  } catch { return [] }
}

function listCaptures(scenario) {
  const dir = join(SCREENSHOTS_DIR, scenario)
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith('.png'))
      .map(f => {
        const s = statSync(join(dir, f))
        return { name: f, size: s.size, time: s.mtime.toISOString() }
      })
      .sort((a, b) => b.time.localeCompare(a.time))
  } catch { return [] }
}

function readScenarioMd(scenario) {
  const p = join(SCREENSHOTS_DIR, scenario, 'scenario.md')
  try { return readFileSync(p, 'utf-8') } catch { return null }
}

function writeScenarioMd(scenario, content) {
  const p = join(SCREENSHOTS_DIR, scenario, 'scenario.md')
  mkdirSync(join(SCREENSHOTS_DIR, scenario), { recursive: true })
  writeFileSync(p, content, 'utf-8')
}

function readScenarioYaml(scenario) {
  const p = join(SCREENSHOTS_DIR, scenario, 'scenario.yaml')
  try { return readFileSync(p, 'utf-8') } catch { return null }
}

// ── JSON API: all scenarios ──
app.get('/api/scenarios', (_req, res) => {
  const scenarios = listScenarios().map(s => {
    const caps = listCaptures(s)
    const md = readScenarioMd(s)
    const yaml = readScenarioYaml(s)
    const status = md ? (md.includes('## Status\n✅') ? 'pass' : md.includes('⏳') ? 'pending' : 'fail') : 'new'
    return {
      name: s,
      captures: caps.length,
      lastCapture: caps[0]?.time || null,
      status,
      hasScript: !!md,
      hasAutomation: !!yaml,
    }
  })
  res.json({ count: scenarios.length, scenarios })
})

app.get('/api/scenarios/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name)
  const scenarios = listScenarios()
  if (!scenarios.includes(name)) return res.status(404).json({ ok: false })
  const caps = listCaptures(name)
  const md = readScenarioMd(name)
  const yaml = readScenarioYaml(name)
  const status = md ? (md.includes('## Status\n✅') ? 'pass' : md.includes('⏳') ? 'pending' : 'fail') : 'new'
  res.json({ name, captures: caps, script: md, automation: yaml, status })
})

app.post('/api/scenarios/:name/script', (req, res) => {
  const name = decodeURIComponent(req.params.name).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
  if (!name) return res.status(400).json({ ok: false })
  const { content } = req.body
  if (!content) return res.status(400).json({ ok: false })
  writeScenarioMd(name, content)
  res.json({ ok: true })
})

// ── Upload capture from local runner ──
app.post('/api/scenarios/:scenario/upload-capture', (req, res) => {
  const scenario = decodeURIComponent(req.params.scenario).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
  const { image, filename } = req.body
  if (!image) return res.status(400).json({ ok: false, error: 'No image provided' })
  const dir = join(SCREENSHOTS_DIR, scenario)
  mkdirSync(dir, { recursive: true })
  const targetFile = filename || `capture-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`
  const buf = Buffer.from(image, 'base64')
  writeFileSync(join(dir, targetFile), buf)
  try { writeFileSync(join(dir, 'latest.png'), buf) } catch {}
  res.json({ ok: true, filename: targetFile })
})

// ── Runner Status API ──
app.get('/api/runner/status', (_req, res) => {
  const isOnline = !!(activeRunner && activeRunner.ws && activeRunner.ws.readyState === WebSocket.OPEN)
  res.json({
    online: isOnline,
    device: isOnline ? activeRunner.device : null,
    model: isOnline ? activeRunner.model : null,
    lastSeen: isOnline ? activeRunner.lastSeen : null
  })
})

// ── Root / Dashboard Page ──
app.get('/', (_req, res) => {
  const scenarios = listScenarios().map(s => {
    const caps = listCaptures(s)
    const md = readScenarioMd(s)
    const yaml = readScenarioYaml(s)
    const status = md ? (md.includes('## Status\n✅') ? 'pass' : md.includes('⏳') ? 'pending' : 'fail') : 'new'
    return {
      name: s,
      captures: caps.length,
      lastCapture: caps[0]?.time || null,
      status,
      hasScript: !!md,
      hasAutomation: !!yaml,
    }
  })

  let apks = []
  try {
    apks = readdirSync(APK_DIR)
      .filter(f => f.endsWith('.apk'))
      .map(f => {
        const s = statSync(join(APK_DIR, f))
        const match = f.match(/bukainjalan-([\d.]+)-\d+/)
        return { name: f, file: f, version: match ? match[1] : '?', size: s.size, time: s.mtime.toISOString() }
      })
      .sort((a, b) => b.time.localeCompare(a.time))
  } catch {}

  const runnerInfo = {
    online: !!(activeRunner && activeRunner.ws?.readyState === WebSocket.OPEN),
    device: activeRunner?.device || null,
    model: activeRunner?.model || null,
  }

  res.send(renderDashboardView({ scenarios, apks, runner: runnerInfo }))
})

// ── Test Bank Index Page ──
app.get('/screenshots', (_req, res) => {
  const scenarios = listScenarios().map(s => {
    const caps = listCaptures(s)
    const md = readScenarioMd(s)
    const yaml = readScenarioYaml(s)
    const status = md ? (md.includes('## Status\n✅') ? 'pass' : md.includes('⏳') ? 'pending' : 'fail') : 'new'
    return {
      name: s,
      captures: caps.length,
      lastCapture: caps[0]?.time || null,
      status,
      hasScript: !!md,
      hasAutomation: !!yaml,
    }
  })
  res.send(renderTestBankView({ scenarios }))
})

// ── Scenario Detail Page ──
app.get('/screenshots/:scenario', (req, res) => {
  const scenario = decodeURIComponent(req.params.scenario)
  const scenarios = listScenarios()
  if (!scenarios.includes(scenario)) return res.redirect('/screenshots')

  const caps = listCaptures(scenario)
  const md = readScenarioMd(scenario)
  const yaml = readScenarioYaml(scenario)
  const status = md ? (md.includes('## Status\n✅') ? 'pass' : md.includes('⏳') ? 'pending' : 'fail') : 'new'

  res.send(renderScenarioDetailView({ scenario, caps, md, yaml, status }))
})

// ── Delete scenario ──
app.get('/screenshots/:scenario/delete', (req, res) => {
  const scenario = decodeURIComponent(req.params.scenario)
  const dir = join(SCREENSHOTS_DIR, scenario)
  try { rmSync(dir, { recursive: true, force: true }) } catch {}
  res.redirect('/screenshots')
})

app.get('/screenshots/:scenario/delete-file', (req, res) => {
  const scenario = decodeURIComponent(req.params.scenario)
  const rawFile = req.query?.file
  const file = rawFile ? decodeURIComponent(rawFile) : null
  if (file && file.endsWith('.png')) {
    try { unlinkSync(join(SCREENSHOTS_DIR, scenario, file)) } catch {}
  }
  if (req.headers.accept?.includes('application/json')) {
    return res.json({ ok: true })
  }
  res.redirect(`/screenshots/${encodeURIComponent(scenario)}`)
})

// ── Capture ──
app.get('/capture', async (req, res) => {
  const scenario = (req.query?.scenario || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
  const target = req.query?.target || (activeRunner ? 'laptop' : 'vps')
  if (!scenario) return res.redirect('/screenshots')

  if (target === 'laptop' && activeRunner && activeRunner.ws?.readyState === WebSocket.OPEN) {
    const jobId = `cap-${Date.now()}`
    const p = new Promise((resolve) => {
      activeJobs.set(jobId, { onDone: resolve, onError: resolve })
      setTimeout(resolve, 10000)
    })
    activeRunner.ws.send(JSON.stringify({ type: 'cmd_capture', jobId, scenario }))
    await p
    activeJobs.delete(jobId)
    return res.redirect(`/screenshots/${encodeURIComponent(scenario)}`)
  }

  // Fallback ke emulator VPS lokal
  const { execSync } = await import('child_process')
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `capture-${ts}.png`
  const dir = join(SCREENSHOTS_DIR, scenario)
  try {
    mkdirSync(dir, { recursive: true })
    execSync(`/home/hermes/platform-tools/adb -s localhost:5555 shell screencap -p /sdcard/screen.png`, { timeout: 15000 })
    execSync(`/home/hermes/platform-tools/adb -s localhost:5555 pull /sdcard/screen.png "${dir}/${filename}"`, { timeout: 10000 })
    execSync(`cp "${dir}/${filename}" "${dir}/latest.png"`, { timeout: 5000 })
  } catch {}
  res.redirect(`/screenshots/${encodeURIComponent(scenario)}`)
})

// ── Run automation test via SSE ──
app.get('/screenshots/:scenario/run', (req, res) => {
  const scenario = decodeURIComponent(req.params.scenario)
  const target = req.query?.target || (activeRunner ? 'laptop' : 'vps')
  const scenarios = listScenarios()
  if (!scenarios.includes(scenario)) return res.status(404).json({ ok: false })

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // JIKA TARGET LAPTOP
  if (target === 'laptop') {
    if (!activeRunner || activeRunner.ws?.readyState !== WebSocket.OPEN) {
      send({ type: 'error', message: 'Laptop Runner Offline! Pastikan laptop-runner.js berjalan di laptop.' })
      return res.end()
    }

    const md = readScenarioMd(scenario)
    const steps = parseMdSteps(md)
    if (steps.length === 0) {
      send({ type: 'error', message: 'Tidak ada step di skenario ini.' })
      return res.end()
    }

    const jobId = `test-${Date.now()}`
    send({ type: 'info', message: `Menjalankan ${steps.length} test steps di emulator laptop (${activeRunner.device})...` })

    activeJobs.set(jobId, {
      onProgress: (p) => send({ type: 'progress', ...p }),
      onStep: (s) => send({ type: 'step', ...s }),
      onResult: (r) => {
        send({ type: 'result', ...r })
        activeJobs.delete(jobId)
        res.end()
      },
      onError: (err) => {
        send({ type: 'error', message: err })
        activeJobs.delete(jobId)
        res.end()
      }
    })

    req.on('close', () => activeJobs.delete(jobId))

    activeRunner.ws.send(JSON.stringify({
      type: 'cmd_test',
      jobId,
      scenario,
      steps
    }))
    return
  }

  // JIKA TARGET VPS
  const runnerScript = join(__dirname, 'test-runner.py')
  if (!existsSync(runnerScript)) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Runner script not found' })}\n\n`)
    return res.end()
  }

  const proc = spawn('/home/hermes/.hermes/hermes-agent/venv/bin/python3', [runnerScript, scenario], {
    cwd: join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 300000,
  })

  let aborted = false
  req.on('close', () => {
    aborted = true
    try { proc.kill() } catch {}
  })

  proc.stdout.on('data', (data) => {
    if (aborted) return
    const lines = data.toString().split('\n').filter(l => l.trim())
    for (const line of lines) {
      try {
        JSON.parse(line)
        res.write(`data: ${line}\n\n`)
      } catch {}
    }
  })

  proc.stderr.on('data', (data) => {
    if (aborted) return
    res.write(`data: ${JSON.stringify({ type: 'log', message: data.toString() })}\n\n`)
  })

  proc.on('exit', (code) => {
    if (!aborted) {
      res.write(`data: ${JSON.stringify({ type: 'exit', code })}\n\n`)
      res.end()
    }
  })
})

// ── APK Management Page ──
app.get('/apks', (_req, res) => {
  const builds = loadBuildHistory()
  res.send(renderApksView({ builds }))
})

// API: List Build History
app.get('/api/apks/history', (_req, res) => {
  res.json({ builds: loadBuildHistory() })
})

// API: Get Build Report by ID
app.get('/api/apks/history/:id', (req, res) => {
  const id = req.params.id
  const builds = loadBuildHistory()
  const b = builds.find(x => x.id == id || x.jobId === id)
  if (!b) return res.status(404).json({ error: 'Build report not found' })
  res.json(b)
})

// API: Get Build Log
app.get('/api/apks/history/:id/log', (req, res) => {
  const id = req.params.id
  const logFile = join(BUILD_LOGS_DIR, `${id}.log`)
  if (existsSync(logFile)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.sendFile(logFile)
  }
  const builds = loadBuildHistory()
  const b = builds.find(x => x.id == id || x.jobId === id)
  if (b?.jobId && existsSync(join(BUILD_LOGS_DIR, `${b.jobId}.log`))) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.sendFile(join(BUILD_LOGS_DIR, `${b.jobId}.log`))
  }
  if (b?.logs && b.logs.length) {
    return res.type('text/plain').send(b.logs.join('\n'))
  }
  res.status(404).send('Log tidak ditemukan')
})

// API: List APKs
app.get('/api/apks', (_req, res) => {
  try {
    const files = readdirSync(APK_DIR)
      .filter(f => f.endsWith('.apk'))
      .map(f => {
        const s = statSync(join(APK_DIR, f))
        const match = f.match(/bukainjalan-([\d.]+)-\d+/)
        return { name: f, file: f, version: match ? match[1] : '?', size: s.size, time: s.mtime.toISOString() }
      })
      .sort((a, b) => b.time.localeCompare(a.time))
    res.json({ count: files.length, apks: files })
  } catch { res.json({ count: 0, apks: [] }) }
})

// API: Build APK via Laptop Runner (0 EAS cloud quota)
app.get('/api/apks/build', (req, res) => {
  const profile = req.query.profile || 'staging'
  const target = req.query.target || (activeRunner ? 'laptop' : 'vps')
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  const send = (type, message, extra = {}) => {
    res.write(`data: ${JSON.stringify({ type, message, ts: new Date().toISOString().slice(0, 19), ...extra })}\n\n`)
  }

  // Register client to listener set
  currentBuild.clients.add(res)

  // Keep-alive heartbeat every 10 seconds to prevent proxy/browser timeout during compile
  const keepAliveTimer = setInterval(() => {
    try {
      res.write(': keepalive\n\n')
    } catch {
      clearInterval(keepAliveTimer)
    }
  }, 10000)

  req.on('close', () => {
    clearInterval(keepAliveTimer)
    currentBuild.clients.delete(res)
  })

  // If a build is ALREADY ACTIVE, send sync state and do not spawn duplicate!
  if (currentBuild.active) {
    send('sync', 'Menghubungkan kembali ke build pipeline yang sedang aktif...', {
      jobId: currentBuild.jobId,
      profile: currentBuild.profile,
      active: true,
      status: currentBuild.status,
      stage: currentBuild.stage,
      progressPct: currentBuild.progressPct,
      statusText: currentBuild.statusText,
      startTime: currentBuild.startTime,
      logs: currentBuild.logs.slice(-200)
    })
    return
  }

  // If a recent build finished in the last 2 minutes, send sync status
  if (currentBuild.endTime && (Date.now() - currentBuild.endTime < 120000)) {
    send('sync', currentBuild.statusText, {
      jobId: currentBuild.jobId,
      profile: currentBuild.profile,
      active: false,
      status: currentBuild.status,
      stage: currentBuild.stage,
      progressPct: currentBuild.progressPct,
      statusText: currentBuild.statusText,
      startTime: currentBuild.startTime,
      logs: currentBuild.logs.slice(-200)
    })
    return res.end()
  }

  if (target === 'laptop') {
    if (!activeRunner || activeRunner.ws?.readyState !== WebSocket.OPEN) {
      send('error', 'Laptop Runner Offline! Pastikan menjalankan node laptop-runner.js di laptop.')
      return res.end()
    }

    const history = loadBuildHistory()
    const nextId = (history[0]?.id || 0) + 1
    const jobId = `build-${Date.now()}`
    currentBuild.active = true
    currentBuild.id = nextId
    currentBuild.jobId = jobId
    currentBuild.profile = profile
    currentBuild.target = 'laptop'
    currentBuild.node = activeRunner ? (activeRunner.model || 'Laptop-Satria') : 'Laptop-Satria'
    currentBuild.startTime = Date.now()
    currentBuild.endTime = null
    currentBuild.status = 'running'
    currentBuild.stage = 'init'
    currentBuild.stageTimes = { init: null, config: null, compile: null, transfer: null, deploy: null }
    currentBuild.progressPct = 10
    currentBuild.statusText = `Mengirim perintah build (${profile}) ke Laptop Runner [${activeRunner.device}]...`
    currentBuild.logs = [currentBuild.statusText]

    saveBuildRecord({
      id: nextId,
      jobId,
      profile,
      target: 'laptop',
      node: currentBuild.node,
      status: 'RUNNING',
      weather: '⛅',
      startTime: currentBuild.startTime,
      endTime: null,
      durationSec: 0,
      stageTimes: currentBuild.stageTimes,
      apkFile: null,
      apkSize: null,
      errorReason: null,
      logs: currentBuild.logs
    })

    send('info', currentBuild.statusText, {
      stage: currentBuild.stage,
      progressPct: currentBuild.progressPct,
      statusText: currentBuild.statusText,
      startTime: currentBuild.startTime
    })

    activeJobs.set(jobId, {
      onLog: (text) => {
        currentBuild.logs.push(text)
        if (currentBuild.logs.length > 500) currentBuild.logs.shift()
        updateBuildTelemetry(text)

        const type = text.includes('BUILD_ERROR') ? 'error' : (text.includes('BUILD_DONE') ? 'done' : 'log')
        const cleanMsg = text.includes('BUILD_ERROR') ? text.replace(/.*BUILD_ERROR\|/, '') : (text.includes('BUILD_DONE') ? text.replace(/.*BUILD_DONE\|/, '') : text)
        
        const payload = `data: ${JSON.stringify({
          type,
          message: cleanMsg,
          stage: currentBuild.stage,
          progressPct: currentBuild.progressPct,
          statusText: currentBuild.statusText,
          ts: new Date().toISOString().slice(0, 19)
        })}\n\n`

        for (const client of currentBuild.clients) {
          try { client.write(payload) } catch {}
        }
      },
      onDone: (data) => {
        currentBuild.active = false
        currentBuild.status = 'success'
        currentBuild.stage = 'deploy'
        currentBuild.progressPct = 100
        currentBuild.statusText = '✓ Build dan SCP transfer selesai! APK tersedia di VPS.'
        currentBuild.endTime = Date.now()

        const durationSec = Math.round((currentBuild.endTime - (currentBuild.startTime || currentBuild.endTime)) / 1000)
        let latestApk = null
        try {
          const apks = readdirSync(APK_DIR)
            .filter(f => f.endsWith('.apk'))
            .map(f => ({ file: f, size: statSync(join(APK_DIR, f)).size, time: statSync(join(APK_DIR, f)).mtimeMs }))
            .sort((a, b) => b.time - a.time)
          if (apks.length > 0) latestApk = apks[0]
        } catch {}

        saveBuildRecord({
          id: currentBuild.id || 1,
          jobId: currentBuild.jobId,
          profile: currentBuild.profile,
          target: currentBuild.target,
          node: currentBuild.node,
          status: 'SUCCESS',
          weather: '☀️',
          startTime: currentBuild.startTime,
          endTime: currentBuild.endTime,
          durationSec,
          stageTimes: currentBuild.stageTimes,
          apkFile: latestApk?.file || null,
          apkSize: latestApk?.size || null,
          errorReason: null,
          logs: currentBuild.logs.slice(-200)
        })

        try {
          writeFileSync(join(BUILD_LOGS_DIR, `${currentBuild.jobId}.log`), currentBuild.logs.join('\n'), 'utf-8')
        } catch {}

        const payload = `data: ${JSON.stringify({
          type: 'done',
          message: data.message || currentBuild.statusText,
          stage: 'deploy',
          progressPct: 100,
          statusText: currentBuild.statusText,
          ts: new Date().toISOString().slice(0, 19)
        })}\n\n`

        for (const client of currentBuild.clients) {
          try {
            client.write(payload)
            client.end()
          } catch {}
        }
        activeJobs.delete(jobId)
      },
      onError: (err) => {
        currentBuild.active = false
        currentBuild.status = 'failed'
        currentBuild.progressPct = 100
        currentBuild.statusText = '✕ Build gagal: ' + (err.message || 'Error tidak diketahui')
        currentBuild.endTime = Date.now()

        const durationSec = Math.round((currentBuild.endTime - (currentBuild.startTime || currentBuild.endTime)) / 1000)
        saveBuildRecord({
          id: currentBuild.id || 1,
          jobId: currentBuild.jobId,
          profile: currentBuild.profile,
          target: currentBuild.target,
          node: currentBuild.node,
          status: 'FAILED',
          weather: '🌧️',
          startTime: currentBuild.startTime,
          endTime: currentBuild.endTime,
          durationSec,
          stageTimes: currentBuild.stageTimes,
          apkFile: null,
          apkSize: null,
          errorReason: err.message || currentBuild.statusText,
          logs: currentBuild.logs.slice(-200)
        })

        try {
          writeFileSync(join(BUILD_LOGS_DIR, `${currentBuild.jobId}.log`), currentBuild.logs.join('\n'), 'utf-8')
        } catch {}

        const payload = `data: ${JSON.stringify({
          type: 'error',
          message: err.message || 'Build gagal',
          progressPct: 100,
          statusText: currentBuild.statusText,
          ts: new Date().toISOString().slice(0, 19)
        })}\n\n`

        for (const client of currentBuild.clients) {
          try {
            client.write(payload)
            client.end()
          } catch {}
        }
        activeJobs.delete(jobId)
      }
    })

    activeRunner.ws.send(JSON.stringify({
      type: 'cmd_build',
      jobId,
      profile
    }))
    return
  }

  send('warn', 'Build via VPS tidak memiliki Docker Android. Gunakan target laptop runner.')
  res.end()
})

// API: Check build status for reconnecting UI
app.get('/api/apks/build/status', (_req, res) => {
  res.json({
    active: currentBuild.active,
    jobId: currentBuild.jobId,
    profile: currentBuild.profile,
    status: currentBuild.status,
    stage: currentBuild.stage,
    progressPct: currentBuild.progressPct,
    statusText: currentBuild.statusText,
    startTime: currentBuild.startTime,
    endTime: currentBuild.endTime,
    logCount: currentBuild.logs.length
  })
})

// API: Install APK to emulator
app.post('/api/apks/install', async (req, res) => {
  const { execSync } = await import('child_process')
  const file = req.body?.file
  if (!file || !file.endsWith('.apk')) return res.json({ ok: false, error: 'Invalid file' })
  
  const apkPath = join(APK_DIR, file)
  if (!existsSync(apkPath)) return res.json({ ok: false, error: 'APK not found' })
  
  try {
    // Push APK to emulator and install
    execSync(`/home/hermes/platform-tools/adb -s localhost:5555 install -r "${apkPath}"`, { timeout: 120000 })
    res.json({ ok: true })
  } catch (e) {
    res.json({ ok: false, error: e.message })
  }
})

// API: Run test on specific APK version
app.post('/api/apks/run-test', async (req, res) => {
  const { execSync } = await import('child_process')
  const { file, scenario } = req.body
  if (!file || !scenario) return res.json({ ok: false, error: 'file and scenario required' })
  
  const apkPath = join(APK_DIR, file)
  if (!existsSync(apkPath)) return res.json({ ok: false, error: 'APK not found' })
  
  try {
    // 1. Install APK
    execSync(`/home/hermes/platform-tools/adb -s localhost:5555 install -r "${apkPath}"`, { timeout: 120000 })
    // 2. Launch app
    execSync(`/home/hermes/platform-tools/adb -s localhost:5555 shell am start -n com.bukainjalan.app/.MainActivity`, { timeout: 10000 })
    // 3. The user can then click Run in the test bank
    res.json({ ok: true, message: 'APK terinstall dan app terbuka. Klik Run di Test Bank.' })
  } catch (e) {
    res.json({ ok: false, error: e.message })
  }
})

// Serve APK files
app.use('/apks', express.static(APK_DIR, {
  maxAge: 0, etag: false, lastModified: false,
  setHeaders: (res) => { res.set('Cache-Control', 'no-store') }
}))

// ── Serve static files ──
app.use('/screenshots', express.static(SCREENSHOTS_DIR, {
  maxAge: 0, etag: false, lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.set('Pragma', 'no-cache'); res.set('Expires', '0')
  }
}))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agents: activeAgents?.size ?? 0, clients: wss?.clients?.size ?? 0 })
})

app.get('/roster', (_req, res) => {
  const mcpServers = discoverMcpServers()
  res.json({ mcpServers, activeAgents: Array.from(activeAgents?.values?.() ?? []) })
})

app.post('/event', (req, res) => {
  const authHeader = req.headers['authorization'] ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (token !== AUTH_TOKEN) return res.status(403).json({ ok: false, error: 'unauthorized' })
  const { type, agent, agentId, status, result, server, tool } = req.body
  broadcast({ type: 'event', event: { type, agent: agent ?? agentId, status, result, server, tool, ts: Date.now() } })
  res.json({ ok: true })
})

// ── WebSocket ──
const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/chat' })
const activeAgents = new Map()

function broadcast(msg) {
  const data = JSON.stringify(msg)
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) { try { ws.send(data) } catch {} }
  }
}

wss.on('connection', (ws) => {
  const id = randomBytes(4).toString('hex')
  ws.send(JSON.stringify({ type: 'welcome', id }))
  ws.send(JSON.stringify({
    type: 'runner_status',
    online: !!(activeRunner && activeRunner.ws?.readyState === WebSocket.OPEN),
    device: activeRunner?.device || null,
    model: activeRunner?.model || null
  }))

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())

      // ── RUNNER REGISTRATION ──
      if (msg.type === 'runner_register') {
        activeRunner = {
          ws,
          id,
          device: msg.device || 'Android Device',
          model: msg.model || 'Emulator',
          lastSeen: Date.now()
        }
        console.log(`[runner] Laptop Runner registered: ${activeRunner.device} (${activeRunner.model})`)
        broadcast({ type: 'runner_status', online: true, device: activeRunner.device, model: activeRunner.model })
        return
      }

      // ── RUNNER LOG STREAM ──
      if (msg.type === 'runner_log') {
        const job = activeJobs.get(msg.jobId)
        if (job?.onLog) job.onLog(msg.message || msg.log)
        return
      }

      // ── RUNNER BUILD / CAPTURE DONE ──
      if (msg.type === 'runner_done') {
        const job = activeJobs.get(msg.jobId)
        if (msg.status === 'error') {
          if (job?.onError) job.onError(new Error(msg.message || 'Build gagal'))
        } else {
          if (job?.onDone) job.onDone(msg)
        }
        return
      }

      // ── RUNNER TEST PROGRESS ──
      if (msg.type === 'runner_progress') {
        const job = activeJobs.get(msg.jobId)
        if (job?.onProgress) job.onProgress(msg)
        return
      }

      // ── RUNNER TEST STEP ──
      if (msg.type === 'runner_step') {
        const job = activeJobs.get(msg.jobId)
        if (job?.onStep) job.onStep(msg)
        return
      }

      // ── RUNNER TEST RESULT ──
      if (msg.type === 'runner_test_result') {
        const job = activeJobs.get(msg.jobId)
        if (job?.onResult) job.onResult(msg)
        return
      }

      // Regular broadcast
      broadcast(msg)
    } catch {}
  })

  ws.on('close', () => {
    if (activeRunner && activeRunner.ws === ws) {
      console.log('[runner] Laptop Runner disconnected')
      activeRunner = null
      broadcast({ type: 'runner_status', online: false })
    }
  })
})

function discoverMcpServers() {
  const paths = [
    join(homedir(), '.claude', 'settings.json'),
    join(homedir(), '.vscode', 'settings.json'),
  ]
  const servers = []
  for (const p of paths) {
    try {
      const data = JSON.parse(readFileSync(p, 'utf-8'))
      const mcp = data.mcpServers ?? data['mcpServers'] ?? {}
      for (const [name, cfg] of Object.entries(mcp)) {
        if (cfg.command) servers.push({ name, command: cfg.command })
      }
    } catch {}
  }
  return servers
}

server.listen(8788, () => {
  const tokenPath = join(homedir(), '.agent-office', 'auth-token')
  writeFileSync(tokenPath, AUTH_TOKEN, 'utf-8')
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║   GAIA Office — Test Bank & Runner       ║')
  console.log(`║   HTTP   : 0.0.0.0:8788                    ║`)
  console.log(`║   WS     : 0.0.0.0:8788/chat               ║`)
  console.log('╚═══════════════════════════════════════════╝')
  console.log(`  Auth token written to: ${tokenPath}`)
  const mcp = discoverMcpServers()
  if (mcp.length) console.log('  MCP servers:', mcp.map(s => s.name).join(', '))
  else console.log('  No MCP servers found in ~/.claude/settings.json')
})

