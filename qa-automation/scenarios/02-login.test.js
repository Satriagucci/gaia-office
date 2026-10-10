/**
 * QA Automation Skenario: 02-login
 * Masuk Akun Terdaftar (Login Flow dengan Penanganan Pre-condition)
 */

import { HomeScreen } from '../screens/home.screen.js'
import { AuthSheetScreen } from '../screens/auth.screen.js'
import { LoginScreen } from '../screens/login.screen.js'

export const metadata = {
  id: '02-login',
  title: 'Masuk Akun (Login)',
  description: 'Pengujian masuk akun pengguna dengan kredensial terdaftar, menangani onboarding dan memastikan pre-condition bersih.',
  stepsCount: 4,
}

export async function run({ driver, detector, reporter }) {
  const home = new HomeScreen(driver, detector, reporter)
  const auth = new AuthSheetScreen(driver, detector, reporter)
  const login = new LoginScreen(driver, detector, reporter)

  reporter.log('🚀 Memulai Skenario 02: Masuk Akun...')

  // Step 1: Launch & Toleransi Timeout Launching
  driver.launchApp()
  const homeVal = await home.validateReady(60)
  await home.handleOnboarding()
  await home.snap(1, 4, `Meluncurkan Aplikasi BukainJalan (${homeVal.duration}s)`, '02_home.png', homeVal.duration)

  // Step 2: Pastikan State Guest & Buka Login Form
  await home.ensureGuestState()
  await home.openProfilTab()
  await auth.tapMasukAccount()
  await login.snap(2, 4, 'Membuka Form Masuk (Login)', '02_login_form.png')

  // Step 3: Isi Kredensial
  await login.fillCredentials('budi.qa@bukainjalan.test', 'Password123!')
  await login.snap(3, 4, 'Mengisi Kredensial Login Akun Terdaftar', '02_login_credentials.png')

  // Step 4: Submit
  await login.submit()
  await login.snap(4, 4, 'Submit Login & Verifikasi Sesi Profil', '02_login_success.png')

  reporter.log('✅ Skenario 02-login selesai 100% dengan sukses!')
  return { status: 'pass', message: 'Skenario login berhasil diverifikasi.' }
}

export default { metadata, run }
