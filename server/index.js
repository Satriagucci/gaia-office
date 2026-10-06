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
  res.send(renderApksView())
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

  const send = (type, message) => {
    res.write(`data: ${JSON.stringify({ type, message, ts: new Date().toISOString().slice(0,19) })}\n\n`)
  }

  if (target === 'laptop') {
    if (!activeRunner || activeRunner.ws?.readyState !== WebSocket.OPEN) {
      send('error', 'Laptop Runner Offline! Pastikan menjalankan node laptop-runner.js di laptop.')
      return res.end()
    }

    const jobId = `build-${Date.now()}`
    send('info', `Mengirim perintah build (${profile}) ke Laptop Runner [${activeRunner.device}]...`)

    activeJobs.set(jobId, {
      onLog: (text) => {
        if (text.includes('BUILD_ERROR')) send('error', text.replace(/.*BUILD_ERROR\|/, ''))
        else if (text.includes('BUILD_DONE') || text.includes('PIPELINE_COMPLETE')) send('done', text.replace(/.*BUILD_DONE\|/, ''))
        else send('log', text)
      },
      onDone: (data) => {
        send('done', data.message || 'Build dan SCP transfer selesai! APK tersedia di VPS.')
        activeJobs.delete(jobId)
        res.end()
      },
      onError: (err) => {
        send('error', err.message || 'Build gagal')
        activeJobs.delete(jobId)
        res.end()
      }
    })

    req.on('close', () => activeJobs.delete(jobId))

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
        if (job?.onDone) job.onDone(msg)
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

