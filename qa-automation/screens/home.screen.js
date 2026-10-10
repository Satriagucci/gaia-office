/**
 * QA Automation — Home Screen (Screen Object)
 * Menangani Layar Beranda, Navigasi Tab, dan Deteksi State Akun (Tamu vs Logged In).
 */

import { BaseScreen } from './base.screen.js'
import { COORDINATES } from '../config/constants.js'

export class HomeScreen extends BaseScreen {
  /**
   * Menunggu dan memvalidasi kesiapan layar utama (default 60s untuk toleransi emulator)
   */
  async validateReady(timeoutSec = 60) {
    this.reporter.log(`Memverifikasi kesiapan Layar Utama BukainJalan (timeout: ${timeoutSec}s)...`)
    const result = await this.waitForScreen('home', timeoutSec)
    this.reporter.log(`✅ Layar Utama berhasil terverifikasi dalam ${result.duration}s`)
    return result
  }

  /**
   * Menangani Onboarding Screen jika muncul di awal peluncuran
   */
  async handleOnboarding() {
    this.reporter.log('Memeriksa apakah layar Onboarding aktif...')
    // Coba tap tombol "Lewati" di kanan atas
    this.driver.tap(COORDINATES.ONBOARDING.LEWATI.x, COORDINATES.ONBOARDING.LEWATI.y)
    await this.sleep(1000)
    // Coba juga tap tombol "Mulai Sekarang" jika di slide terakhir
    this.driver.tap(COORDINATES.ONBOARDING.MULAI_SEKARANG.x, COORDINATES.ONBOARDING.MULAI_SEKARANG.y)
    await this.sleep(1200)
  }

  /**
   * Memastikan aplikasi berada dalam keadaan Guest (Halo, Tamu!)
   * Jika masih dalam keadaan login (Kondisi 3), lakukan logout terlebih dahulu.
   */
  async ensureGuestState() {
    this.reporter.log('Memeriksa status autentikasi pengguna (Tamu vs Sudah Login)...')
    
    // Tap menu Profil
    this.driver.tap(COORDINATES.TABS.PROFIL.x, COORDINATES.TABS.PROFIL.y)
    await this.sleep(1800)

    // Periksa apakah Auth Sheet muncul
    try {
      await this.waitForScreen('auth_sheet', 6)
      this.reporter.log('✅ Mode Tamu terdeteksi: Bottom Sheet Autentikasi langsung aktif.')
      return { isGuest: true, state: 'guest' }
    } catch {
      this.reporter.log('⚠️ Terdeteksi akun dalam keadaan login! Melakukan alur Logout...')
    }

    // Scroll ke bawah di halaman Profil untuk menemukan tombol Logout
    this.reporter.log('Menggulir halaman Profil ke bawah untuk menemukan tombol Logout...')
    this.driver.swipe(540, 1800, 540, 600, 500)
    await this.sleep(1000)

    // Tap tombol Logout di posisi bawah (540, 1920)
    this.reporter.log('Menekan tombol Logout...')
    this.driver.tap(540, 1920)
    await this.sleep(1500)

    // Konfirmasi keluar: Tap "Ya, Keluar" di ActionableSheet (540, 2020)
    this.reporter.log('Mengonfirmasi dialog "Ya, Keluar"...')
    this.driver.tap(540, 2020)
    await this.sleep(2000)

    // Kembali ke Beranda & validasi
    this.driver.tap(COORDINATES.TABS.BERANDA.x, COORDINATES.TABS.BERANDA.y)
    await this.sleep(1500)
    await this.validateReady(30)
    this.reporter.log('✅ Logout berhasil. Akun kembali ke status "Halo, Tamu!".')

    return { isGuest: true, state: 'logged_out_to_guest' }
  }

  /**
   * Pindah ke tab Profil
   */
  async openProfilTab() {
    this.reporter.log('Menekan tab Profil...')
    this.driver.tap(COORDINATES.TABS.PROFIL.x, COORDINATES.TABS.PROFIL.y)
    await this.sleep(1500)
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
