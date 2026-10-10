/**
 * QA Automation — Base Screen
 * Induk dari semua Screen Object Model (SOM).
 */

export class BaseScreen {
  constructor(driver, detector, reporter) {
    this.driver = driver
    this.detector = detector
    this.reporter = reporter
  }

  async sleep(ms) {
    return this.driver.sleep(ms)
  }

  async waitForScreen(screenKey, timeoutSec = 25) {
    return this.detector.waitForScreen(screenKey, {
      timeoutSec,
      onProgress: (sec, msg) => {
        this.reporter.log(`⏳ [${sec}s] ${msg}`)
      }
    })
  }

  async snap(index, total, name, filename, duration = null) {
    return this.reporter.recordStep(index, total, name, filename, duration)
  }
}

export default BaseScreen
