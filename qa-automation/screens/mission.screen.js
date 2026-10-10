/**
 * QA Automation — Mission Screen (Screen Object)
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class MissionScreen extends BaseScreen {
  async selectCategoryJasaFisik() {
    this.reporter.log('Memilih Kategori Jasa Fisik...')
    this.driver.tap(COORDINATES.MISSION.CATEGORY_JASA_FISIK.x, COORDINATES.MISSION.CATEGORY_JASA_FISIK.y)
    await this.sleep(2000)
  }
}

export default MissionScreen
