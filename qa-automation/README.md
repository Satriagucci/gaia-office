# 🧪 GAIA Office — QA Automation Framework

Framework pengujian otomatisasi mobile end-to-end (E2E) dan modular untuk **BukainJalan**, dirancang dengan standar industri **QA Engineering (Screen Object Model)** yang *modular, plug-and-play, dan terintegrasi ke CI/CD Pipeline*.

---

## 📁 Struktur Folder Komprehensif

```
qa-automation/
├── config/                     # Konfigurasi lingkungan, akun pengujian & konstanta
│   ├── constants.js            # Package ID, timeout, dan koordinat acuan layar
│   └── index.js                # URL endpoint, koneksi WebSocket, dan akun QA
│
├── core/                       # Inti mesin automation
│   ├── driver.js               # Driver perangkat ADB (tap, type, swipe, keyevent, screencap)
│   ├── screen-detector.js      # Validator status layar visual & stopwatch durasi nyata
│   └── reporter.js             # Perekam step, screenshot uploader & SSE event emitter
│
├── screens/                    # Screen Object Model (SOM) — Modular & Bongkar Pasang
│   ├── base.screen.js          # Kelas induk SOM dengan fungsi umum
│   ├── home.screen.js          # Layar Beranda (kategori, tab bar, status)
│   ├── auth.screen.js          # Bottom Sheet Autentikasi (daftar/masuk)
│   ├── register.screen.js      # Form Pendaftaran Akun Baru
│   ├── login.screen.js         # Form Masuk Akun
│   ├── mission.screen.js       # Form & Dialog Pembuatan Misi
│   ├── wallet.screen.js        # Layar Dompet & Verifikasi Escrow
│   └── radar.screen.js         # Layar Radar Geospasial & Talent Radar
│
├── scenarios/                  # Kepingan Skenario Pengujian (Test Suites)
│   ├── 01-daftar.test.js       # Skenario 1: Registrasi Akun Baru
│   ├── 02-login.test.js        # Skenario 2: Masuk Akun Terdaftar
│   ├── 03-membuat-misi.test.js # Skenario 3: Inisiasi Misi Jasa
│   ├── 04-pembayaran.test.js   # Skenario 4: Escrow & Dompet
│   └── 05-ambil-misi.test.js   # Skenario 5: Peta Radar & Talent
│
├── pipeline/                   # Integrasi ke Web Dashboard & CI/CD
│   └── runner.js               # Runner orkestrasi skenario individual / full suite
│
└── README.md                   # Dokumentasi teknis & panduan QA
```

---

## 🧩 Konsep "Bongkar Pasang" (Plug & Play)

### 1. Menambah Layar Baru (`screens/`)
Cukup buat file turunan dari `BaseScreen`:
```javascript
// qa-automation/screens/notifikasi.screen.js
import { BaseScreen } from './base.screen.js'

export class NotificationScreen extends BaseScreen {
  async openNotificationCenter() {
    this.driver.tap(950, 150)
  }
}
```

### 2. Menambah Skenario Baru (`scenarios/`)
Cukup buat file `*.test.js` di dalam folder `scenarios/`. Runner akan **secara otomatis mendeteksi dan mendaftarkannya**:
```javascript
// qa-automation/scenarios/06-notifikasi.test.js
export const metadata = {
  id: '06-notifikasi',
  title: 'Pusat Notifikasi Real-time',
  stepsCount: 2
}

export async function run({ driver, detector, reporter }) {
  // Panggil layar-layar yang dibutuhkan
  ...
}
```

---

## 🚀 Cara Menjalankan

### Melalui CLI (Local Terminal)
Jalankan satu skenario kepingan:
```bash
node qa-automation/pipeline/runner.js --scenario=01-daftar
```

Jalankan seluruh suite pengujian (Full E2E):
```bash
node qa-automation/pipeline/runner.js --scenario=all
```

### Melalui GAIA Office Web Dashboard
Pengujian ini sudah terhubung secara *real-time* ke **GAIA Office Laptop Runner** via WebSocket dan Server-Sent Events (SSE). Klik tombol **Run Skenario** di website, dan runner akan mengeksekusi kepingan skenario di emulator secara otomatis.
