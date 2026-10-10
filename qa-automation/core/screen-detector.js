/**
 * QA Automation — Screen Detector & State Validator
 * Memvalidasi kondisi layar secara visual dan memastikan transisi benar-benar selesai sebelum aksi dilanjutkan.
 */

import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class ScreenDetector {
  constructor(driver) {
    this.driver = driver
    this.pyValidator = join(__dirname, '..', '..', 'server', 'validate_screen.py')
  }

  /**
   * Menunggu layar target sampai terverifikasi secara visual
   * @param {string} targetScreen - 'home' | 'auth_sheet' | 'register_form' | 'login_form'
   * @param {object} options - { timeoutSec: 25, onProgress: fn }
   */
  async waitForScreen(targetScreen, options = {}) {
    const { timeoutSec = 25, onProgress = null } = options
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const py = spawn('python', [
        this.pyValidator,
        this.driver.deviceId,
        targetScreen,
        String(timeoutSec)
      ], { windowsHide: true })

      let lastDuration = '0.0'
      let lastMsg = ''

      py.stdout.on('data', (d) => {
        const text = d.toString()
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
        for (const line of lines) {
          const parts = line.split('|')
          if (parts[0] === 'WAIT') {
            const elapsed = parts[1]
            const msg = parts[2]
            if (onProgress) onProgress(elapsed, msg)
          } else if (parts[0] === 'SUCCESS') {
            lastDuration = parts[1]
            lastMsg = parts[2]
          } else if (parts[0] === 'TIMEOUT') {
            lastDuration = parts[1]
            lastMsg = parts[2]
          }
        }
      })

      py.on('close', (code) => {
        const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1)
        if (code === 0) {
          resolve({
            ok: true,
            duration: lastDuration || elapsedTotal,
            detectedScreen: lastMsg || targetScreen
          })
        } else {
          reject(new Error(lastMsg || `Gagal memvalidasi layar '${targetScreen}' setelah ${elapsedTotal}s`))
        }
      })

      py.on('error', (err) => {
        reject(err)
      })
    })
  }
}

export default ScreenDetector
