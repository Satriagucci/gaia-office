/**
 * QA Automation — Auth Bottom Sheet (Screen Object)
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class AuthSheetScreen extends BaseScreen {
  async validateReady(timeoutSec = 15) {
    this.reporter.log('Menunggu Bottom Sheet Autentikasi terbuka...')
    const result = await this.waitForScreen('auth_sheet', timeoutSec)
    this.reporter.log(`✅ Bottom Sheet Autentikasi aktif (${result.duration}s)`)
    return result
  }

  async tapDaftarWithEmail() {
    this.reporter.log('Memilih opsi "Daftar dengan Email"...')
    this.driver.tap(COORDINATES.AUTH_SHEET.DAFTAR_EMAIL.x, COORDINATES.AUTH_SHEET.DAFTAR_EMAIL.y)
    await this.sleep(1500)
  }

  async tapMasukAccount() {
    this.reporter.log('Memilih opsi "Sudah punya akun? Masuk"...')
    this.driver.tap(COORDINATES.AUTH_SHEET.SUDAH_PUNYA_AKUN.x, COORDINATES.AUTH_SHEET.SUDAH_PUNYA_AKUN.y)
    await this.sleep(1500)
  }
}

export default AuthSheetScreen
