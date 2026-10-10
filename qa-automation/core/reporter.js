/**
 * QA Automation — Test Step Reporter
 * Mengelola hasil pengujian, capture screenshot per step, dan streaming ke dashboard / SSE.
 */

import { readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { TEST_CONFIG } from '../config/index.js'

export class TestReporter {
  constructor(driver, options = {}) {
    this.driver = driver
    this.scenario = options.scenario || 'e2e'
    this.jobId = options.jobId || `qa-${Date.now()}`
    this.onStepCallback = options.onStep || null
    this.onLogCallback = options.onLog || null
    this.onProgressCallback = options.onProgress || null
    this.steps = []
  }

  log(message) {
    console.log(`[QA] ${message}`)
    if (this.onLogCallback) {
      this.onLogCallback(message)
    }
  }

  async recordStep(index, total, name, screenshotFilename, customDuration = null) {
    const tempFile = join(tmpdir(), `step-${Date.now()}.png`)
    let uploaded = false

    // Ambil screenshot
    const shot = this.driver.takeScreenshot(tempFile)
    if (shot) {
      try {
        const base64 = readFileSync(tempFile).toString('base64')
        try { unlinkSync(tempFile) } catch {}

        // Upload ke GAIA Office HTTP endpoint dengan metadata lengkap
        const uploadUrl = `${TEST_CONFIG.httpUrl}/api/scenarios/${encodeURIComponent(this.scenario)}/upload-capture`
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            filename: screenshotFilename,
            runId: this.jobId,
            stepIndex: index,
            total,
            name,
            duration: customDuration,
            status: 'pass'
          })
        })
        const d = await res.json()
        uploaded = d?.ok || false
      } catch (e) {
        console.warn(`[reporter] Gagal mengunggah tangkapan layar (${screenshotFilename}):`, e.message)
      }
    }

    const stepResult = {
      stepIndex: index,
      total,
      name,
      screenshot: screenshotFilename,
      status: 'pass',
      duration: customDuration,
      uploaded
    }

    this.steps.push(stepResult)

    if (this.onStepCallback) {
      this.onStepCallback(stepResult)
    }

    if (this.onProgressCallback) {
      const pct = Math.round((index / total) * 100)
      this.onProgressCallback(index, total, pct)
    }

    return stepResult
  }
}

export default TestReporter
