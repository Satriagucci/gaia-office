/**
 * QA Automation — Home Screen (Screen Object)
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class HomeScreen extends BaseScreen {
  /**
   * Menunggu dan memvalidasi kesiapan layar utama
   */
  async validateReady(timeoutSec = 30) {
    this.reporter.log('Memverifikasi kesiapan Layar Utama BukainJalan...')
    const result = await this.waitForScreen('home', timeoutSec)
    this.reporter.log(`✅ Layar Utama berhasil terverifikasi dalam ${result.duration}s`)
    return result
  }

  /**
   * Pindah ke tab Profil
   */
  async openProfilTab() {
    this.reporter.log('Menekan tab Profil...')
    this.driver.tap(COORDINATES.TABS.PROFIL.x, COORDINATES.TABS.PROFIL.y)
    await this.sleep(1200)
  }

  /**
   * Pindah ke tab Beranda
   */
  async openBerandaTab() {
    this.reporter.log('Menekan tab Beranda...')
    this.driver.tap(COORDINATES.TABS.BERANDA.x, COORDINATES.TABS.BERANDA.y)
    await this.sleep(1000)
  }

  /**
   * Pindah ke tab Peta / Radar
   */
  async openPetaTab() {
    this.reporter.log('Menekan tab Peta/Radar...')
    this.driver.tap(COORDINATES.TABS.PETA.x, COORDINATES.TABS.PETA.y)
    await this.sleep(1500)
  }

  /**
   * Menekan tombol tambah misi (+)
   */
  async tapCreateMission() {
    this.reporter.log('Menekan tombol (+) Tambah Misi Baru...')
    this.driver.tap(COORDINATES.TABS.ADD_BUTTON.x, COORDINATES.TABS.ADD_BUTTON.y)
    await this.sleep(1500)
  }

  /**
   * Membuka kartu dompet / saldo
   */
  async openWallet() {
    this.reporter.log('Membuka kartu Dompet & Status Escrow...')
    this.driver.tap(COORDINATES.MISSION.DOMPET_CARD.x, COORDINATES.MISSION.DOMPET_CARD.y)
    await this.sleep(1500)
  }
}

export default HomeScreen
