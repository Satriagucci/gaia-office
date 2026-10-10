/**
 * Kepingan Test Bank 03: Membuat Misi Baru (Create Mission)
 * 
 * Menguji verifikasi nomor HP client, validasi input pembuatan misi,
 * perhitungan biaya reward, dan status transisi misi ke AWAITING_PAYMENT.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com';

export async function testBuatMisi({ baseUrl = BASE_URL, token = null, user = null } = {}) {
  const results = {
    scenario: '03-membuat-misi',
    status: 'pass',
    durationMs: 0,
    tests: [],
    createdMission: null
  };

  const startTime = Date.now();

  try {
    let authToken = token;
    let runId = Date.now().toString().slice(-6);

    // Siapkan client jika belum tersedia
    if (!authToken) {
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `qa_client_${runId}@bukainjalan.test`,
          username: `cli_${runId}`,
          name: `Client QA ${runId}`,
          password: 'Password123!'
        })
      });
      const regData = await regRes.json();
      authToken = regData.data?.accessToken || regData.accessToken;
      if (!authToken) throw new Error('Gagal membuat user client untuk test misi');
    }

    // 1. VERIFIKASI NOMOR HP (Agar memenuhi syarat pembuatan misi Level 2)
    const t0 = Date.now();
    const verifyRes = await fetch(`${baseUrl}/kyc/contact/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        type: 'phone',
        value: `0812${runId}888`,
        code: '1234'
      })
    });
    const verifyDuration = Date.now() - t0;
    const verifyData = await verifyRes.json();

    if (verifyRes.ok && verifyData.success) {
      results.tests.push({
        name: 'Verifikasi Nomor Telepon Client (Level 2 Requirement)',
        status: 'pass',
        durationMs: verifyDuration,
        details: 'Nomor telepon berhasil diverifikasi via OTP'
      });
    } else {
      results.tests.push({
        name: 'Verifikasi Nomor Telepon Client',
        status: 'fail',
        durationMs: verifyDuration,
        details: `Verifikasi telepon gagal: ${verifyData.message}`
      });
    }

    // 2. NEGATIVE TEST: REWARD DI BAWAH BATAS MINIMUM (< Rp 1.000)
    const t1 = Date.now();
    const badMissionRes = await fetch(`${baseUrl}/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Misi Ilegal Murah',
        description: 'Misi ini sengaja memiliki reward di bawah batas aturan sistem.',
        reward: 500,
        workersNeeded: 1
      })
    });
    const badMissionDuration = Date.now() - t1;

    if (badMissionRes.status >= 400) {
      results.tests.push({
        name: 'Validasi Batas Minimum Reward (< Rp 1.000)',
        status: 'pass',
        durationMs: badMissionDuration,
        details: `Berhasil diblokir sistem validasi (HTTP ${badMissionRes.status})`
      });
    } else {
      results.tests.push({
        name: 'Validasi Batas Minimum Reward',
        status: 'fail',
        durationMs: badMissionDuration,
        details: 'Server mengizinkan reward di bawah Rp 1.000!'
      });
      results.status = 'fail';
    }

    // 3. HAPPY PATH: BUAT MISI BARU VALID
    const missionTitle = `Bantu Antar Dokumen QA ${runId}`;
    const missionReward = 35000;

    const t2 = Date.now();
    const createRes = await fetch(`${baseUrl}/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: missionTitle,
        description: 'Perlu bantuan segera antar dokumen penting dari Senayan ke Menteng hari ini.',
        reward: missionReward,
        workersNeeded: 1,
        city: 'Jakarta Pusat',
        isOnline: false
      })
    });
    const createDuration = Date.now() - t2;
    const createData = await createRes.json();

    if (!createRes.ok || !createData.success) {
      throw new Error(`Pembuatan misi gagal (${createRes.status}): ${JSON.stringify(createData)}`);
    }

    const mission = createData.data;
    if (!mission?.id) throw new Error('ID misi tidak ditemukan pada respon sukses');

    results.tests.push({
      name: 'Pembuatan Misi Baru oleh Client',
      status: 'pass',
      durationMs: createDuration,
      details: `Misi ID: ${mission.id}, Status: ${mission.status}, PaymentStatus: ${mission.paymentStatus}`
    });

    // 4. VERIFIKASI STATUS AWAL MISI (Harus AWAITING_PAYMENT sebelum bayar)
    if (mission.status === 'AWAITING_PAYMENT' || mission.paymentStatus === 'PENDING') {
      results.tests.push({
        name: 'Integritas Status Awal (AWAITING_PAYMENT)',
        status: 'pass',
        durationMs: 0,
        details: 'Misi terkunci dalam status pending payment sebelum escrow didanai'
      });
    } else {
      results.tests.push({
        name: 'Integritas Status Awal',
        status: 'fail',
        durationMs: 0,
        details: `Status tidak sesuai: ${mission.status} / ${mission.paymentStatus}`
      });
      results.status = 'fail';
    }

    results.createdMission = mission;

  } catch (err) {
    results.status = 'fail';
    results.tests.push({
      name: 'Fatal Error Pengujian Buat Misi',
      status: 'fail',
      error: err.message
    });
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

if (process.argv[1]?.endsWith('03-membuat-misi.js')) {
  testBuatMisi().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.status === 'pass' ? 0 : 1);
  });
}
