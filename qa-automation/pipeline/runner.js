/**
 * QA Automation — Pipeline Test Runner Orchestrator
 * Menjalankan skenario pengujian modular (kepingan individual maupun full E2E suite).
 */

import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { DeviceDriver } from '../core/driver.js'
import { ScreenDetector } from '../core/screen-detector.js'
import { TestReporter } from '../core/reporter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCENARIOS_DIR = join(__dirname, '..', 'scenarios')

/**
 * Daftar skenario yang terdaftar secara modular
 */
export async function loadAvailableScenarios() {
  const files = readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.test.js')).sort()
  const map = {}
  for (const file of files) {
    const mod = await import(`../scenarios/${file}`)
    const id = mod.metadata?.id || file.replace('.test.js', '')
    map[id] = {
      file,
      metadata: mod.metadata || { id, title: id, stepsCount: 5 },
      run: mod.run
    }
  }
  return map
}

/**
 * Eksekusi QA Pipeline
 * @param {string} targetScenario - 'all' | '01-daftar' | '02-login' | dsb.
 * @param {object} callbacks - { onStep, onLog, onProgress, onDone }
 */
export async function runQaPipeline(targetScenario = 'all', callbacks = {}, customDeviceId = null) {
  const driver = new DeviceDriver(customDeviceId)
  driver.ensureAwake()

  const detector = new ScreenDetector(driver)
  const scenariosMap = await loadAvailableScenarios()

  const isAll = targetScenario === 'all' || targetScenario === 'all-scenarios'
  const scenarioKeys = isAll
    ? Object.keys(scenariosMap)
    : Object.keys(scenariosMap).filter(k => k === targetScenario || targetScenario.includes(k))

  if (scenarioKeys.length === 0) {
    throw new Error(`Skenario '${targetScenario}' tidak ditemukan di qa-automation/scenarios! Tersedia: ${Object.keys(scenariosMap).join(', ')}`)
  }

  const overallResults = []

  for (const key of scenarioKeys) {
    const scenario = scenariosMap[key]
    const reporter = new TestReporter(driver, {
      scenario: key,
      jobId: `job-${Date.now()}`,
      onStep: callbacks.onStep,
      onLog: callbacks.onLog,
      onProgress: callbacks.onProgress,
    })

    reporter.log(`\n========================================`)
    reporter.log(`🚀 RUNNER: Menjalankan [${key}] - ${scenario.metadata.title}`)
    reporter.log(`========================================`)

    try {
      const res = await scenario.run({ driver, detector, reporter })
      overallResults.push({ id: key, status: 'pass', details: res })
    } catch (err) {
      reporter.log(`❌ ERROR pada [${key}]: ${err.message}`)
      overallResults.push({ id: key, status: 'fail', error: err.message })
      if (!isAll) throw err
    }
  }

  const allPassed = overallResults.every(r => r.status === 'pass')
  const finalSummary = {
    status: allPassed ? 'pass' : 'fail',
    totalScenarios: scenarioKeys.length,
    passed: overallResults.filter(r => r.status === 'pass').length,
    failed: overallResults.filter(r => r.status === 'fail').length,
    results: overallResults
  }

  if (callbacks.onDone) {
    callbacks.onDone(finalSummary)
  }

  return finalSummary
}

// Support CLI direct invocation: `node runner.js --scenario=01-daftar`
if (process.argv[1] === __filename) {
  const argScenario = process.argv.find(a => a.startsWith('--scenario='))?.split('=')[1] || '01-daftar'
  console.log(`[CLI] Memulai QA Pipeline Runner dengan skenario: ${argScenario}`)
  runQaPipeline(argScenario, {
    onLog: (msg) => console.log(`[LIVE LOG] ${msg}`),
    onStep: (step) => console.log(`[LIVE STEP ${step.stepIndex}/${step.total}] ${step.name} -> ${step.status}`),
    onProgress: (cur, tot, pct) => console.log(`[PROGRESS] ${pct}% (${cur}/${tot})`),
    onDone: (summary) => console.log(`[SUMMARY] Finished:`, summary)
  }).then(() => {
    console.log('[CLI] Runner selesai dengan sukses.')
    process.exit(0)
  }).catch((err) => {
    console.error('[CLI] Runner gagal:', err.message)
    process.exit(1)
  })
}

export default { runQaPipeline, loadAvailableScenarios }
