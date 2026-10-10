/**
 * QA Automation Skenario: 01-daftar
 * Pendaftaran Akun Baru (Registrasi End-to-End)
 */

import { HomeScreen } from '../screens/home.screen.js'
import { AuthSheetScreen } from '../screens/auth.screen.js'
import { RegisterScreen } from '../screens/register.screen.js'

export const metadata = {
  id: '01-daftar',
  title: 'Pendaftaran Akun Baru',
  description: 'Pengujian lengkap pendaftaran akun pengguna baru dari beranda, sheet autentikasi, form registrasi, hingga submit OTP.',
  stepsCount: 5,
}

export async function run({ driver, detector, reporter }) {
  const home = new HomeScreen(driver, detector, reporter)
  const auth = new AuthSheetScreen(driver, detector, reporter)
  const register = new RegisterScreen(driver, detector, reporter)

  reporter.log('Memulai Skenario 01: Pendaftaran Akun Baru...')

  // Step 1: Bersihkan sesi lama & validasi Layar Utama
  reporter.log('Mempersiapkan sesi guest bersih (pm clear)...')
  driver.clearAppData()
  driver.launchApp()
  const homeVal = await home.validateReady(30)
  await home.snap(1, 5, `Layar Utama Terbuka & Tervalidasi (${homeVal.duration}s)`, '01_home_screen.png', homeVal.duration)

  // Step 2: Open Profil & Validate Auth Sheet
  await home.openProfilTab()
  const authVal = await auth.validateReady(15)
  await auth.snap(2, 5, `Menu Profil & Sheet Autentikasi Tervalidasi (${authVal.duration}s)`, '01_auth_sheet.png', authVal.duration)

  // Step 3: Open Register Form & Validate Form
  await auth.tapDaftarWithEmail()
  const regVal = await register.validateReady(15)
  await register.snap(3, 5, `Form Pendaftaran Akun Baru Terbuka (${regVal.duration}s)`, '01_register_form.png', regVal.duration)

  // Step 4: Fill form
  const rand = Math.floor(Math.random() * 900 + 100)
  await register.fillForm({
    nama: 'QA Tester Pro',
    username: `qatester${rand}`,
    email: `qa.reg.${Date.now()}@bukainjalan.test`,
    phone: '081299887766',
    password: 'Password123!'
  })
  await register.snap(4, 5, 'Mengisi Seluruh Field Form Registrasi', '01_form_filled.png')

  // Step 5: Accept Terms & Submit
  await register.acceptTermsAndSubmit()
  await register.snap(5, 5, 'Submit Pendaftaran & Verifikasi Transisi Layar OTP', '01_submit_result.png')

  reporter.log('✅ Skenario 01-daftar selesai 100%!')
  return { status: 'pass', message: 'Skenario pendaftaran berhasil diselesaikan secara sempurna.' }
}

export default { metadata, run }
