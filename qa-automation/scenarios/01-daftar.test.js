/**
 * QA Automation Skenario: 01-daftar
 * Pendaftaran Akun Baru (Registrasi End-to-End dengan Penanganan State Komprehensif)
 */

import { HomeScreen } from '../screens/home.screen.js'
import { AuthSheetScreen } from '../screens/auth.screen.js'
import { RegisterScreen } from '../screens/register.screen.js'

export const metadata = {
  id: '01-daftar',
  title: 'Pendaftaran Akun Baru',
  description: 'Pengujian lengkap pendaftaran akun baru: menangani onboarding, memvalidasi mode tamu (Halo, Tamu!), menangani logout jika akun sudah login, hingga registrasi dan verifikasi.',
  stepsCount: 5,
}

export async function run({ driver, detector, reporter }) {
  const home = new HomeScreen(driver, detector, reporter)
  const auth = new AuthSheetScreen(driver, detector, reporter)
  const register = new RegisterScreen(driver, detector, reporter)

  reporter.log('🚀 Memulai Skenario 01: Pendaftaran Akun Baru...')

  // Step 1: Launch Aplikasi & Tangani Onboarding (Kondisi 1 & Toleransi Timeout)
  driver.launchApp()
  // Berikan timeout 60s untuk toleransi cold-start emulator
  const homeVal = await home.validateReady(60)
  await home.handleOnboarding()
  await home.snap(1, 5, `Layar Utama Terbuka & Onboarding Ditangani (${homeVal.duration}s)`, '01_home_screen.png', homeVal.duration)

  // Step 2: Cek State Pengguna (Kondisi 2 & 3: Pastikan Guest Mode / Logout jika sudah login)
  const authState = await home.ensureGuestState()
  // Buka Auth Sheet dari Tab Profil
  await home.openProfilTab()
  const authVal = await auth.validateReady(20)
  await auth.snap(2, 5, `Mode Tamu Aktif & Sheet Autentikasi Siap (${authVal.duration}s)`, '01_auth_sheet.png', authVal.duration)

  // Step 3: Navigasi ke Form Pendaftaran
  await auth.tapDaftarWithEmail()
  const regVal = await register.validateReady(20)
  await register.snap(3, 5, `Form Pendaftaran Akun Baru Terbuka (${regVal.duration}s)`, '01_register_form.png', regVal.duration)

  // Step 4: Mengisi Data Pendaftaran Akun Baru
  const rand = Math.floor(Math.random() * 9000 + 1000)
  const newAccount = {
    nama: `QA Tester ${rand}`,
    username: `qatester${rand}`,
    email: `qa.reg.${Date.now()}@bukainjalan.test`,
    phone: `0812${rand}8899`,
    password: 'Password123!'
  }
  reporter.log(`Mengisi formulir dengan user: ${newAccount.username} (${newAccount.email})...`)
  await register.fillForm(newAccount)
  await register.snap(4, 5, 'Mengisi Seluruh Field Form Registrasi', '01_form_filled.png')

  // Step 5: Menyetujui Ketentuan & Submit
  await register.acceptTermsAndSubmit()
  await register.snap(5, 5, 'Submit Pendaftaran & Verifikasi Transisi Layar OTP', '01_submit_result.png')

  reporter.log('✅ Skenario 01-daftar selesai 100% dengan sukses!')
  return { status: 'pass', message: 'Skenario pendaftaran berhasil diselesaikan secara sempurna.' }
}

export default { metadata, run }
