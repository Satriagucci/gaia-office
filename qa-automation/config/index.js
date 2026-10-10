/**
 * QA Automation — Environment & Test Config
 */

import { APP_CONFIG, TIMEOUTS, COORDINATES } from './constants.js'

export const TEST_CONFIG = {
  vpsHost: process.env.VPS_HOST || '100.89.171.112',
  vpsPort: process.env.VPS_PORT || '8788',
  get httpUrl() {
    return `http://${this.vpsHost}:${this.vpsPort}`
  },
  get wsUrl() {
    return `ws://${this.vpsHost}:${this.vpsPort}/chat`
  },

  // Akun pengujian standar untuk smoke / regression test
  testAccounts: {
    qaUser: {
      nama: 'QA Automation Engineer',
      username: 'qa.engineer.pro',
      email: 'budi.qa@bukainjalan.test',
      phone: '081299887766',
      password: 'Password123!',
    }
  },

  app: APP_CONFIG,
  timeouts: TIMEOUTS,
  coords: COORDINATES,
}

export default TEST_CONFIG
