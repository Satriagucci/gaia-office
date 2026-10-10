/**
 * QA Automation Skenario: 04-melakukan-pembayaran
 * Dompet & Perlindungan Escrow
 */

import { HomeScreen } from '../screens/home.screen.js'
import { WalletScreen } from '../screens/wallet.screen.js'

export const metadata = {
  id: '04-melakukan-pembayaran',
  title: 'Dompet & Escrow Pembayaran',
  description: 'Pengujian transparansi saldo dan keamanan escrow transaksi jasa.',
  stepsCount: 3,
}

export async function run({ driver, detector, reporter }) {
  const home = new HomeScreen(driver, detector, reporter)
  const wallet = new WalletScreen(driver, detector, reporter)

  reporter.log('Memulai Skenario 04: Dompet & Escrow Pembayaran...')

  // Step 1: Launch
  driver.launchApp()
  const homeVal = await home.validateReady(30)
  await home.openBerandaTab()
  await home.snap(1, 3, `Kembali ke Layar Beranda (${homeVal.duration}s)`, '04_home_balance.png', homeVal.duration)

  // Step 2: Open Dompet
  await home.openWallet()
  await wallet.snap(2, 3, 'Membuka Dompet & Status Escrow', '04_dompet_screen.png')

  // Step 3: Verify Escrow
  await wallet.verifyEscrowSecured()
  await wallet.snap(3, 3, 'Verifikasi Perlindungan Escrow Terkunci Aman', '04_escrow_secured.png')

  return { status: 'pass', message: 'Skenario dompet dan escrow berhasil diverifikasi.' }
}

export default { metadata, run }
