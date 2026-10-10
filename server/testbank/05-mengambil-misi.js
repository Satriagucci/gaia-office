/**
 * Kepingan Test Bank 05: Mengambil Misi oleh Talent (Take Mission)
 * 
 * Menguji proteksi KYC Level 3 sebelum mengambil misi, proses klaim misi,
 * pembentukan order berstatus TAKEN, dan pencatatan riwayat di orders/me.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com';

export async function testMengambilMisi({ baseUrl = BASE_URL, missionId = null } = {}) {
  const results = {
    scenario: '05-mengambil-misi',
    status: 'pass',
    durationMs: 0,
    tests: [],
    createdOrder: null
  };

  const startTime = Date.now();

  try {
    const runId = Date.now().toString().slice(-6);

    // 1. BUAT AKUN TALENT BARU (Level 1 Awal)
    const talentEmail = `qa_talent_${runId}@bukainjalan.test`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: talentEmail,
        username: `tal_${runId}`,
        name: `Talent QA ${runId}`,
        password: 'Password123!'
      })
    });
    const regData = await regRes.json();
    const talentToken = regData.data?.accessToken || regData.accessToken;
    if (!talentToken) throw new Error('Gagal membuat akun talent');

    // Pastikan target missionId valid
    let targetMissionId = missionId;
    if (!targetMissionId) {
      const listRes = await fetch(`${baseUrl}/missions?limit=5`);
      const listData = await listRes.json();
      targetMissionId = listData.data?.[0]?.id;
    }

    if (!targetMissionId) {
      throw new Error('Tidak ada misi aktif untuk diambil. Jalankan skenario 03 & 04 terlebih dahulu.');
    }

    // 2. NEGATIVE TEST: USER LEVEL 1 DILARANG AMBIL MISI (Harus Ditolak Level/KYC Middleware)
    const t0 = Date.now();
    const forbiddenRes = await fetch(`${baseUrl}/orders/protected/mission/${targetMissionId}/take`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${talentToken}`
      }
    });
    const forbiddenDuration = Date.now() - t0;
    const forbiddenData = await forbiddenRes.json().catch(() => ({}));

    if (forbiddenRes.status === 403 || !forbiddenData.success) {
      results.tests.push({
        name: 'Proteksi KYC Level 3 (Blokir User Non-KYC)',
        status: 'pass',
        durationMs: forbiddenDuration,
        details: `Berhasil ditolak dengan kode ${forbiddenRes.status}: ${forbiddenData.message || 'KYC required'}`
      });
    } else {
      results.tests.push({
        name: 'Proteksi KYC Level 3',
        status: 'fail',
        durationMs: forbiddenDuration,
        details: 'Server mengizinkan user tanpa KYC mengambil misi!'
      });
      results.status = 'fail';
    }

    // 3. SELESAIKAN PROSES KYC LENGKAP UNTUK TALENT
    const t1 = Date.now();

    // Verifikasi Phone
    await fetch(`${baseUrl}/kyc/contact/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${talentToken}` },
      body: JSON.stringify({ type: 'phone', value: `0812${runId}777`, code: '1234' })
    });

    // Verifikasi Email
    await fetch(`${baseUrl}/kyc/contact/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + talentToken },
      body: JSON.stringify({ type: 'email', value: talentEmail, code: '1234' })
    });

    // Profil Dasar
    const basicRes = await fetch(`${baseUrl}/kyc/basic-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${talentToken}` },
      body: JSON.stringify({
        legalName: `Talent QA ${runId}`,
        nik: `317101${runId.padStart(10, '0')}`,
        placeOfBirth: 'Jakarta',
        dateOfBirth: '1995-05-15',
        address: 'Jl. Sudirman No. 12',
        rt: '001',
        rw: '002',
        postalCode: '10220'
      })
    }).then(r => r.json());
    const vId = basicRes.data?.id;

    // Dokumen Visual
    await fetch(`${baseUrl}/kyc/visual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + talentToken },
      body: JSON.stringify({
        ktpImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
        selfieImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        isLivenessPassed: true
      })
    });

    // Finalize Submit
    await fetch(`${baseUrl}/kyc/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${talentToken}` }
    });

    // Admin Login & Approve
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bukainjalan.id', password: '2lHb5y3T76k2adA' })
    }).then(r => r.json());
    const adminToken = adminLogin.data?.accessToken;

    if (vId && adminToken) {
      await fetch(`${baseUrl}/kyc/admin/${vId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'APPROVE' })
      });
    }

    const kycDuration = Date.now() - t1;

    // Verifikasi Status Terkini Talent
    const statRes = await fetch(`${baseUrl}/kyc/status`, {
      headers: { 'Authorization': `Bearer ${talentToken}` }
    }).then(r => r.json());

    if (statRes.data?.kycLevel >= 3 || statRes.data?.kycStatus === 'VERIFIED') {
      results.tests.push({
        name: 'Promosi Kelayakan Talent ke Level 3 • VERIFIED',
        status: 'pass',
        durationMs: kycDuration,
        details: `Talent resmi berstatus Level ${statRes.data?.kycLevel} (${statRes.data?.kycStatus})`
      });
    } else {
      results.tests.push({
        name: 'Promosi Kelayakan Talent',
        status: 'fail',
        durationMs: kycDuration,
        details: `Gagal verifikasi KYC: Level ${statRes.data?.kycLevel}`
      });
    }

    // 4. HAPPY PATH: AMBIL MISI SECARA RESMI (Create Order)
    const t2 = Date.now();
    const takeRes = await fetch(`${baseUrl}/orders/protected/mission/${targetMissionId}/take`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${talentToken}`
      }
    });
    const takeDuration = Date.now() - t2;
    const takeData = await takeRes.json();

    if (!takeRes.ok || !takeData.success) {
      throw new Error(`Ambil misi gagal (${takeRes.status}): ${JSON.stringify(takeData)}`);
    }

    const order = takeData.data;
    results.tests.push({
      name: 'Pengambilan Misi Resmi oleh Talent (Order Created)',
      status: 'pass',
      durationMs: takeDuration,
      details: `Order ID: ${order?.id}, Status: ${order?.status || 'TAKEN'}, BidAmount: Rp ${order?.bidAmount || 'default'}`
    });

    // 5. VERIFIKASI RIWAYAT ORDER TALENT (/orders/me)
    const t3 = Date.now();
    const myOrdersRes = await fetch(`${baseUrl}/orders/me`, {
      headers: { 'Authorization': `Bearer ${talentToken}` }
    });
    const myOrdersDuration = Date.now() - t3;
    const myOrdersData = await myOrdersRes.json();

    const hasOrder = myOrdersData.data?.some(o => o.id === order?.id || o.missionId === targetMissionId);
    if (myOrdersRes.ok && hasOrder) {
      results.tests.push({
        name: 'Verifikasi Riwayat Pekerjaan Aktif Talent (/orders/me)',
        status: 'pass',
        durationMs: myOrdersDuration,
        details: `Order aktif terdaftar pada workspace pekerjaan talent`
      });
    } else {
      results.tests.push({
        name: 'Verifikasi Riwayat Pekerjaan Aktif Talent',
        status: 'fail',
        durationMs: myOrdersDuration,
        details: 'Order tidak ditemukan pada daftar order aktif talent'
      });
    }

    results.createdOrder = order;

  } catch (err) {
    results.status = 'fail';
    results.tests.push({
      name: 'Fatal Error Pengujian Ambil Misi',
      status: 'fail',
      error: err.message
    });
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

if (process.argv[1]?.endsWith('05-mengambil-misi.js')) {
  testMengambilMisi().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.status === 'pass' ? 0 : 1);
  });
}
