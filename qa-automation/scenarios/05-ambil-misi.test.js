/**
 * QA Automation Skenario: 05-mengambil-misi
 * Peta Radar & Talent Radar
 */

import { HomeScreen } from '../screens/home.screen.js'
import { RadarScreen } from '../screens/radar.screen.js'

export const metadata = {
  id: '05-mengambil-misi',
  title: 'Peta Radar & Talent Radar',
  description: 'Pengujian radar geospasial pencarian misi dan talent terdekat.',
  stepsCount: 3,
}

export async function run({ driver, detector, reporter }) {
  const home = new HomeScreen(driver, detector, reporter)
  const radar = new RadarScreen(driver, detector, reporter)

  reporter.log('Memulai Skenario 05: Radar & Ambil Misi...')

  // Step 1: Open Map
  driver.launchApp()
  const homeVal = await home.validateReady(60)
  await home.handleOnboarding()
  await home.openPetaTab()
  await radar.snap(1, 3, `Membuka Peta Radar Misi di Sekitar (${homeVal.duration}s)`, '05_radar_map.png', homeVal.duration)

  // Step 2: Switch to Talent
  await radar.switchToTalentRadar()
  await radar.snap(2, 3, 'Beralih ke Radar Talent & Siap Ambil Misi', '05_talent_radar.png')

  // Step 3: Back to Home
  await home.openBerandaTab()
  await home.snap(3, 3, 'Misi Sukses Terpantau di Radar', '05_completed_radar.png')

  return { status: 'pass', message: 'Skenario peta radar berhasil diverifikasi.' }
}

export default { metadata, run }
