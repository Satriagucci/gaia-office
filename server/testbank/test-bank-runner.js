/**
 * GAIA TEST BANK RUNNER & SUITE ORCHESTRATOR
 * 
 * Mengeksekusi setiap kepingan skenario di Test Bank secara independen
 * maupun digabungkan secara berurutan menjadi End-to-End flow.
 * 
 * Penggunaan:
 *   node test-bank-runner.js                    # Jalankan seluruh kepingan secara berurutan
 *   node test-bank-runner.js --scenario=01      # Jalankan kepingan 01 saja (Daftar)
 *   node test-bank-runner.js --scenario=02      # Jalankan kepingan 02 saja (Login)
 *   node test-bank-runner.js --scenario=03      # Jalankan kepingan 03 saja (Buat Misi)
 *   node test-bank-runner.js --scenario=04      # Jalankan kepingan 04 saja (Bayar Escrow)
 *   node test-bank-runner.js --scenario=05      # Jalankan kepingan 05 saja (Ambil Misi)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { testDaftar } from './01-daftar.js';
import { testLogin } from './02-login.js';
import { testBuatMisi } from './03-membuat-misi.js';
import { testMelakukanPembayaran } from './04-melakukan-pembayaran.js';
import { testMengambilMisi } from './05-mengambil-misi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '..', '..', 'public', 'screenshots');
const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com';

function updateScenarioStatus(scenarioName, isPass, summaryText = '') {
  const mdPath = join(SCREENSHOTS_DIR, scenarioName, 'scenario.md');
  if (!existsSync(mdPath)) return;
  try {
    let content = readFileSync(mdPath, 'utf-8');
    const newStatus = isPass ? '## Status\n✅ PASS' : '## Status\n❌ FAIL';
    content = content.replace(/## Status\s*[\r\n]+(✅ PASS|❌ FAIL|⏳ Pending)/g, newStatus);
    
    // Tambahkan catatan eksekusi terakhir
    const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const telemetrySection = `\n\n### Catatan Eksekusi Terakhir (${dateStr} WIB)\n${summaryText}`;
    if (content.includes('### Catatan Eksekusi Terakhir')) {
      content = content.replace(/### Catatan Eksekusi Terakhir[\s\S]*$/, telemetrySection.trim());
    } else {
      content += telemetrySection;
    }

    writeFileSync(mdPath, content, 'utf-8');
  } catch (err) {
    console.warn(`[test-bank] Gagal memperbarui status ${scenarioName}: ${err.message}`);
  }
}

export async function runTestBankSuite({ filterScenario = null } = {}) {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         GAIA TEST BANK: MODULAR SCENARIOS & E2E SUITE         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`[Config] Target API: ${BASE_URL}\n`);

  const suiteResults = {
    startTime: new Date().toISOString(),
    totalScenarios: 0,
    passed: 0,
    failed: 0,
    scenarios: []
  };

  let sharedContext = {
    registeredUser: null,
    session: null,
    createdMission: null,
    payment: null,
    order: null
  };

  const shouldRun = (name) => !filterScenario || name.toLowerCase().includes(filterScenario.toLowerCase());

  // ─────────────────────────────────────────────────────────────
  // 1. KEPINGAN 01: DAFTAR
  // ─────────────────────────────────────────────────────────────
  if (shouldRun('01') || shouldRun('daftar')) {
    suiteResults.totalScenarios++;
    console.log('▶ Menjalankan [Kepingan 01: Pendaftaran Akun]...');
    const res01 = await testDaftar({ baseUrl: BASE_URL });
    suiteResults.scenarios.push(res01);
    const isPass = res01.status === 'pass';
    if (isPass) {
      suiteResults.passed++;
      sharedContext.registeredUser = res01.createdUser;
      console.log(`  ✓ LULUS (${res01.durationMs}ms) — User: ${res01.createdUser?.email}`);
    } else {
      suiteResults.failed++;
      console.log(`  ✗ GAGAL (${res01.durationMs}ms)`);
    }
    const sum01 = res01.tests.map(t => `- [${t.status.toUpperCase()}] ${t.name}: ${t.details || t.error}`).join('\n');
    updateScenarioStatus('01-daftar', isPass, sum01);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. KEPINGAN 02: LOGIN
  // ─────────────────────────────────────────────────────────────
  if (shouldRun('02') || shouldRun('login')) {
    suiteResults.totalScenarios++;
    console.log('▶ Menjalankan [Kepingan 02: Masuk & Otentikasi]...');
    const res02 = await testLogin({ baseUrl: BASE_URL, user: sharedContext.registeredUser });
    suiteResults.scenarios.push(res02);
    const isPass = res02.status === 'pass';
    if (isPass) {
      suiteResults.passed++;
      sharedContext.session = res02.session;
      console.log(`  ✓ LULUS (${res02.durationMs}ms) — Token terbit & profil terverifikasi`);
    } else {
      suiteResults.failed++;
      console.log(`  ✗ GAGAL (${res02.durationMs}ms)`);
    }
    const sum02 = res02.tests.map(t => `- [${t.status.toUpperCase()}] ${t.name}: ${t.details || t.error}`).join('\n');
    updateScenarioStatus('02-login', isPass, sum02);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. KEPINGAN 03: MEMBUAT MISI
  // ─────────────────────────────────────────────────────────────
  if (shouldRun('03') || shouldRun('membuat') || shouldRun('misi')) {
    suiteResults.totalScenarios++;
    console.log('▶ Menjalankan [Kepingan 03: Membuat Misi Baru]...');
    const res03 = await testBuatMisi({
      baseUrl: BASE_URL,
      token: sharedContext.session?.token,
      user: sharedContext.registeredUser
    });
    suiteResults.scenarios.push(res03);
    const isPass = res03.status === 'pass';
    if (isPass) {
      suiteResults.passed++;
      sharedContext.createdMission = res03.createdMission;
      console.log(`  ✓ LULUS (${res03.durationMs}ms) — Misi ID: ${res03.createdMission?.id}`);
    } else {
      suiteResults.failed++;
      console.log(`  ✗ GAGAL (${res03.durationMs}ms)`);
    }
    const sum03 = res03.tests.map(t => `- [${t.status.toUpperCase()}] ${t.name}: ${t.details || t.error}`).join('\n');
    updateScenarioStatus('03-membuat-misi', isPass, sum03);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. KEPINGAN 04: MELAKUKAN PEMBAYARAN
  // ─────────────────────────────────────────────────────────────
  if (shouldRun('04') || shouldRun('pembayaran') || shouldRun('bayar')) {
    suiteResults.totalScenarios++;
    console.log('▶ Menjalankan [Kepingan 04: Melakukan Pembayaran Escrow]...');
    const res04 = await testMelakukanPembayaran({
      baseUrl: BASE_URL,
      missionId: sharedContext.createdMission?.id
    });
    suiteResults.scenarios.push(res04);
    const isPass = res04.status === 'pass';
    if (isPass) {
      suiteResults.passed++;
      sharedContext.payment = res04.paymentData;
      console.log(`  ✓ LULUS (${res04.durationMs}ms) — QRIS/VA settlement berhasil, Misi OPEN`);
    } else {
      suiteResults.failed++;
      console.log(`  ✗ GAGAL (${res04.durationMs}ms)`);
    }
    const sum04 = res04.tests.map(t => `- [${t.status.toUpperCase()}] ${t.name}: ${t.details || t.error}`).join('\n');
    updateScenarioStatus('04-melakukan-pembayaran', isPass, sum04);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. KEPINGAN 05: MENGAMBIL MISI
  // ─────────────────────────────────────────────────────────────
  if (shouldRun('05') || shouldRun('mengambil') || shouldRun('ambil')) {
    suiteResults.totalScenarios++;
    console.log('▶ Menjalankan [Kepingan 05: Mengambil Misi oleh Talent]...');
    const res05 = await testMengambilMisi({
      baseUrl: BASE_URL,
      missionId: sharedContext.createdMission?.id
    });
    suiteResults.scenarios.push(res05);
    const isPass = res05.status === 'pass';
    if (isPass) {
      suiteResults.passed++;
      sharedContext.order = res05.createdOrder;
      console.log(`  ✓ LULUS (${res05.durationMs}ms) — Order ID: ${res05.createdOrder?.id}`);
    } else {
      suiteResults.failed++;
      console.log(`  ✗ GAGAL (${res05.durationMs}ms)`);
    }
    const sum05 = res05.tests.map(t => `- [${t.status.toUpperCase()}] ${t.name}: ${t.details || t.error}`).join('\n');
    updateScenarioStatus('05-mengambil-misi', isPass, sum05);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`RINGKASAN TEST BANK: ${suiteResults.passed}/${suiteResults.totalScenarios} Skenario LULUS (Passed)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return suiteResults;
}

// CLI Execution support
const args = process.argv.slice(2);
let scenarioArg = null;
for (const a of args) {
  if (a.startsWith('--scenario=')) scenarioArg = a.split('=')[1];
}

runTestBankSuite({ filterScenario: scenarioArg }).then(res => {
  process.exit(res.failed === 0 ? 0 : 1);
}).catch(err => {
  console.error('Fatal Suite Error:', err);
  process.exit(1);
});
