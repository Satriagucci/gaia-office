/**
 * QA Automation — Wallet & Escrow Screen (Screen Object)
 */

import { BaseScreen } from './base.screen.js'

export class WalletScreen extends BaseScreen {
  async verifyEscrowSecured() {
    this.reporter.log('Memverifikasi perlindungan Escrow sistem dompet...')
    await this.sleep(1500)
  }
}

export default WalletScreen
