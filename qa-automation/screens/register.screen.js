/**
 * QA Automation — Register Form Screen (Screen Object)
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class RegisterScreen extends BaseScreen {
  async validateReady(timeoutSec = 15) {
    this.reporter.log('Menunggu Form Pendaftaran Akun Baru terbuka...')
    const result = await this.waitForScreen('register_form', timeoutSec)
    this.reporter.log(`✅ Form Pendaftaran Akun Baru siap digunakan (${result.duration}s)`)
    return result
  }

  async fillForm(userData) {
    const {
      nama = 'QA Automation Pro',
      username = `qa${Math.floor(Math.random() * 900 + 100)}`,
      email = `qa.reg.${Date.now()}@bukainjalan.test`,
      phone = '081299887766',
      password = 'Password123!'
    } = userData

    this.reporter.log(`Mengisi Nama Lengkap: "${nama}"...`)
    this.driver.tap(COORDINATES.REGISTER_FORM.INPUT_NAMA.x, COORDINATES.REGISTER_FORM.INPUT_NAMA.y)
    await this.sleep(400)
    this.driver.typeText(nama)
    this.driver.pressKey(4) // Sembunyikan keyboard
    await this.sleep(300)

    this.reporter.log(`Mengisi Username: "${username}"...`)
    this.driver.tap(COORDINATES.REGISTER_FORM.INPUT_USERNAME.x, COORDINATES.REGISTER_FORM.INPUT_USERNAME.y)
    await this.sleep(400)
    this.driver.typeText(username)
    this.driver.pressKey(4)
    await this.sleep(300)

    this.reporter.log(`Mengisi Email: "${email}"...`)
    this.driver.tap(COORDINATES.REGISTER_FORM.INPUT_EMAIL.x, COORDINATES.REGISTER_FORM.INPUT_EMAIL.y)
    await this.sleep(400)
    this.driver.typeText(email)
    this.driver.pressKey(4)
    await this.sleep(300)

    this.reporter.log(`Mengisi Nomor HP: "${phone}"...`)
    this.driver.tap(COORDINATES.REGISTER_FORM.INPUT_PHONE.x, COORDINATES.REGISTER_FORM.INPUT_PHONE.y)
    await this.sleep(400)
    this.driver.typeText(phone)
    this.driver.pressKey(4)
    await this.sleep(300)

    this.reporter.log('Mengisi Kata Sandi...')
    this.driver.tap(COORDINATES.REGISTER_FORM.INPUT_PASSWORD.x, COORDINATES.REGISTER_FORM.INPUT_PASSWORD.y)
    await this.sleep(400)
    this.driver.typeText(password)
    this.driver.pressKey(4)
    await this.sleep(500)
  }

  async acceptTermsAndSubmit() {
    this.reporter.log('Menggulir ke bagian bawah untuk persetujuan S&K...')
    this.driver.swipe(540, 1800, 540, 800, 300)
    await this.sleep(600)

    this.reporter.log('Mencentang Checkbox Syarat & Ketentuan...')
    this.driver.tap(COORDINATES.REGISTER_FORM.CHECKBOX_TERMS.x, COORDINATES.REGISTER_FORM.CHECKBOX_TERMS.y)
    await this.sleep(500)

    this.reporter.log('Menekan tombol "Daftar Sekarang"...')
    this.driver.tap(COORDINATES.REGISTER_FORM.BTN_SUBMIT.x, COORDINATES.REGISTER_FORM.BTN_SUBMIT.y)
    await this.sleep(3000)
  }
}

export default RegisterScreen
