/**
 * QA Automation — Login Screen (Screen Object)
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class LoginScreen extends BaseScreen {
  async fillCredentials(identifier, password) {
    this.reporter.log(`Mengisi kredensial login: "${identifier}"...`)
    this.driver.tap(COORDINATES.LOGIN_FORM.INPUT_IDENTIFIER.x, COORDINATES.LOGIN_FORM.INPUT_IDENTIFIER.y)
    await this.sleep(400)
    this.driver.typeText(identifier)
    this.driver.pressKey(4)
    await this.sleep(300)

    this.reporter.log('Mengisi kata sandi...')
    this.driver.tap(COORDINATES.LOGIN_FORM.INPUT_PASSWORD.x, COORDINATES.LOGIN_FORM.INPUT_PASSWORD.y)
    await this.sleep(400)
    this.driver.typeText(password)
    this.driver.pressKey(4)
    await this.sleep(500)
  }

  async submit() {
    this.reporter.log('Menekan tombol Masuk...')
    this.driver.tap(COORDINATES.LOGIN_FORM.BTN_SUBMIT.x, COORDINATES.LOGIN_FORM.BTN_SUBMIT.y)
    await this.sleep(2500)
  }
}

export default LoginScreen
