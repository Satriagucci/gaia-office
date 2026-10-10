/**
 * QA Automation — Constants
 * Mendefinisikan konstanta aplikasi, nama package, timeout, dan batas koordinat perangkat.
 */

export const APP_CONFIG = {
  PACKAGE_NAME: 'com.bukainjalan.app',
  MAIN_ACTIVITY: 'com.bukainjalan.app/.MainActivity',
  BASE_URL: process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com',
}

export const TIMEOUTS = {
  SCREEN_VALIDATION: 30000, // 30 detik max untuk validasi layar
  STEP_INTERVAL: 800,       // Polling interval tiap 800ms
  INPUT_DELAY: 350,         // Jeda antar pengetikan input
  ANIMATION_WAIT: 1500,     // Tunggu transisi sheet / dialog
}

// Koordinat referensi layar standar 1080x2280
export const COORDINATES = {
  // Navigation Bar Bawah
  TABS: {
    BERANDA: { x: 100, y: 2080 },
    PETA: { x: 295, y: 2080 },
    ADD_BUTTON: { x: 540, y: 1980 },
    CHAT: { x: 690, y: 2080 },
    PROFIL: { x: 900, y: 2080 },
  },

  // Onboarding Screen
  ONBOARDING: {
    LEWATI: { x: 845, y: 140 },
    MULAI_SEKARANG: { x: 520, y: 2010 },
  },

  // Auth Bottom Sheet
  AUTH_SHEET: {
    DAFTAR_EMAIL: { x: 540, y: 1890 },
    SUDAH_PUNYA_AKUN: { x: 540, y: 2090 },
  },

  // Form Registrasi (1080x2280)
  REGISTER_FORM: {
    INPUT_NAMA: { x: 500, y: 950 },
    INPUT_USERNAME: { x: 500, y: 1220 },
    INPUT_EMAIL: { x: 500, y: 1490 },
    INPUT_PHONE: { x: 500, y: 1750 },
    INPUT_PASSWORD: { x: 500, y: 2020 },
    CHECKBOX_TERMS: { x: 146, y: 1587 }, // Setelah scroll
    BTN_SUBMIT: { x: 540, y: 1800 },     // Setelah scroll
  },

  // Form Login
  LOGIN_FORM: {
    INPUT_IDENTIFIER: { x: 540, y: 1050 },
    INPUT_PASSWORD: { x: 540, y: 1250 },
    BTN_SUBMIT: { x: 540, y: 1450 },
  },

  // Layar Misi & Radar
  MISSION: {
    CATEGORY_JASA_FISIK: { x: 505, y: 1030 },
    DOMPET_CARD: { x: 540, y: 420 },
    SWITCH_TALENT_RADAR: { x: 720, y: 180 },
  }
}
