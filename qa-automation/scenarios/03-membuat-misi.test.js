/**
 * QA Automation Skenario: 03-membuat-misi
 * Pembuatan Misi Baru (Post Task Flow)
 */

import { HomeScreen } from '../screens/home.screen.js'
import { MissionScreen } from '../screens/mission.screen.js'

export const metadata = {
  id: '03-membuat-misi',
  title: 'Membuat Misi Baru',
  description: 'Pengujian pemilihan kategori dan inisiasi pembuatan misi jasa.',
  stepsCount: 4,
}

export async function run({ driver, detector, reporter }) {
  const home = new HomeScreen(driver, detector, reporter)
  const mission = new MissionScreen(driver, detector, reporter)

  reporter.log('Memulai Skenario 03: Membuat Misi Baru...')

  // Step 1: Launch & Feed
  driver.launchApp()
  const homeVal = await home.validateReady(60)
  await home.handleOnboarding()
  await home.openBerandaTab()
  await home.snap(1, 4, `Meninjau Layar Beranda Feed (${homeVal.duration}s)`, '03_home_feed.png', homeVal.duration)

  // Step 2: Open Dialog
  await home.tapCreateMission()
  await home.snap(2, 4, 'Membuka Dialog Buat Misi', '03_buat_misi_dialog.png')

  // Step 3: Choose Category
  await mission.selectCategoryJasaFisik()
  await mission.snap(3, 4, 'Memilih Kategori Jasa Fisik', '03_kategori_selected.png')

  // Step 4: Verify Draft
  await mission.sleep(1000)
  await mission.snap(4, 4, 'Verifikasi Draft Form Misi Siap Dibuat', '03_mission_ready.png')

  return { status: 'pass', message: 'Skenario buat misi berhasil diverifikasi.' }
}

export default { metadata, run }
