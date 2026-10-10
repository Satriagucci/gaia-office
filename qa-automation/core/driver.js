/**
 * QA Automation — Device Driver Wrapper
 * Mengisolasi semua perintah ADB tingkat rendah dengan error handling dan sanitasi parameter.
 */

import { execSync, spawn } from 'child_process'
import { readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { APP_CONFIG } from '../config/constants.js'

export class DeviceDriver {
  constructor(deviceId) {
    this.deviceId = deviceId || this.autoDetectDevice()
  }

  autoDetectDevice() {
    try {
      const out = execSync('adb devices', { encoding: 'utf-8' })
      const lines = out.split('\n').filter(l => l.trim() && !l.startsWith('List of'))
      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        if (parts[1] === 'device') {
          return parts[0]
        }
      }
    } catch (e) {
      console.warn('[driver] Gagal mendeteksi adb device:', e.message)
    }
    return 'emulator-5554'
  }

  /**
   * Menjalankan perintah ADB shell
   */
  shell(cmd, timeoutMs = 10000) {
    try {
      return execSync(`adb -s ${this.deviceId} shell ${cmd}`, {
        encoding: 'utf-8',
        timeout: timeoutMs,
        stdio: ['ignore', 'pipe', 'pipe']
      }).trim()
    } catch (err) {
      return err.stdout?.toString() || ''
    }
  }

  /**
   * Pastikan layar aktif, tidak lockscreen, dan tidak tertidur
   */
  ensureAwake() {
    try {
      this.shell('svc power stayon true')
      this.shell('settings put system screen_off_timeout 2147483647')
      this.shell('input keyevent 224') // KEYCODE_WAKEUP
      this.shell('wm dismiss-keyguard')
      this.shell('am force-stop com.android.vending') // Hentikan Play store jika mencuri fokus
    } catch {}
  }

  /**
   * Memeriksa apakah aplikasi BukainJalan memiliki fokus aktif di layar
   */
  isAppFocused() {
    try {
      const out = this.shell('dumpsys window')
      return out.includes('mCurrentFocus') && out.includes(APP_CONFIG.PACKAGE_NAME)
    } catch {
      return false
    }
  }

  /**
   * Meluncurkan aplikasi ke layar utama
   */
  launchApp() {
    this.ensureAwake()
    this.shell(`am start -n ${APP_CONFIG.MAIN_ACTIVITY}`)
  }

  /**
   * Menghentikan paksa aplikasi
   */
  forceStopApp() {
    this.shell(`am force-stop ${APP_CONFIG.PACKAGE_NAME}`)
  }

  /**
   * Reset data aplikasi (clean guest state)
   */
  clearAppData() {
    this.shell(`pm clear ${APP_CONFIG.PACKAGE_NAME}`)
  }

  /**
   * Sentuh koordinat layar
   */
  tap(x, y) {
    this.shell(`input tap ${x} ${y}`)
  }

  /**
   * Ketik teks ke field aktif
   */
  typeText(text) {
    // Sanitasi spasi untuk adb input text
    const sanitized = text.replace(/ /g, '%s')
    this.shell(`input text "${sanitized}"`)
  }

  /**
   * Kirim keyevent (misal: Back = 4, Enter = 66)
   */
  pressKey(code) {
    this.shell(`input keyevent ${code}`)
  }

  /**
   * Geser layar (swipe)
   */
  swipe(x1, y1, x2, y2, durationMs = 300) {
    this.shell(`input swipe ${x1} ${y1} ${x2} ${y2} ${durationMs}`)
  }

  /**
   * Ambil tangkapan layar perangkat
   */
  takeScreenshot(outputPath) {
    const tempFile = outputPath || join(tmpdir(), `cap-${Date.now()}.png`)
    try {
      this.shell('screencap -p /sdcard/_screen_cap.png', 15000)
      execSync(`adb -s ${this.deviceId} pull /sdcard/_screen_cap.png "${tempFile}"`, { timeout: 15000, stdio: 'ignore' })
      this.shell('rm /sdcard/_screen_cap.png', 5000)
      return tempFile
    } catch (e) {
      console.warn(`[driver] Gagal capture screenshot: ${e.message}`)
      return null
    }
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }
}

export default DeviceDriver
