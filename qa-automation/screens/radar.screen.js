/**
 * QA Automation — Radar Screen (Screen Object)
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class RadarScreen extends BaseScreen {
  async switchToTalentRadar() {
    this.reporter.log('Beralih ke tab Radar Talent...')
    this.driver.tap(COORDINATES.MISSION.SWITCH_TALENT_RADAR.x, COORDINATES.MISSION.SWITCH_TALENT_RADAR.y)
    await this.sleep(2000)
  }
}

export default RadarScreen
