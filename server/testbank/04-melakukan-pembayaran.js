/**
 * Kepingan Test Bank 04: Melakukan Pembayaran Escrow (Payment)
 * 
 * Menguji pembuatan dynamic QRIS, pembuatan Virtual Account,
 * verifikasi polling payment status, dan simulasi instant settlement.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com';

export async function testMelakukanPembayaran({ baseUrl = BASE_URL, missionId = null, token = null } = {}) {
  const results = {
    scenario: '04-melakukan-pembayaran',
    status: 'pass',
    durationMs: 0,
    tests: [],
    paymentData: null
  };

  const startTime = Date.now();

  try {
    let targetMissionId = missionId;

    // Jika missionId tidak dioper, cari misi open atau buat cepat
    if (!targetMissionId) {
      const listRes = await fetch(`${baseUrl}/missions?limit=5`);
      const listData = await listRes.json();
      const firstMission = listData.data?.[0];
      if (firstMission?.id) {
        targetMissionId = firstMission.id;
      } else {
        throw new Error('Tidak ada misi yang tersedia untuk diuji pembayarannya. Jalankan skenario 03 terlebih dahulu.');
      }
    }

    // 1. GENERATE DYNAMIC QRIS (EMVCo Payload)
    const t0 = Date.now();
    const qrisRes = await fetch(`${baseUrl}/payment/qris`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'mission',
        entityId: targetMissionId
      })
    });
    const qrisDuration = Date.now() - t0;
    const qrisData = await qrisRes.json();

    if (qrisRes.ok && qrisData.success && qrisData.data?.qrString) {
      results.tests.push({
        name: 'Generate Dynamic QRIS (EMVCo Protocol)',
        status: 'pass',
        durationMs: qrisDuration,
        details: `QRIS String valid (${qrisData.data.qrString.length} chars), Nominal: Rp ${qrisData.data.amount}`
      });
    } else {
      results.tests.push({
        name: 'Generate Dynamic QRIS',
        status: 'fail',
        durationMs: qrisDuration,
        details: `Gagal generate QRIS: ${JSON.stringify(qrisData)}`
      });
      results.status = 'fail';
    }

    // 2. GENERATE CLOSED VIRTUAL ACCOUNT (BCA)
    const t1 = Date.now();
    const vaRes = await fetch(`${baseUrl}/payment/va`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'mission',
        entityId: targetMissionId,
        bankCode: 'BCA'
      })
    });
    const vaDuration = Date.now() - t1;
    const vaData = await vaRes.json();

    if (vaRes.ok && vaData.success && vaData.data?.accountNumber) {
      results.tests.push({
        name: 'Generate Virtual Account BCA',
        status: 'pass',
        durationMs: vaDuration,
        details: `VA Number: ${vaData.data.accountNumber}, Expired: ${vaData.data.expirationDate?.slice(0, 10)}`
      });
    } else {
      results.tests.push({
        name: 'Generate Virtual Account BCA',
        status: 'fail',
        durationMs: vaDuration,
        details: `Gagal generate VA: ${JSON.stringify(vaData)}`
      });
    }

    // 3. CEK STATUS POLLING PEMBAYARAN
    const t2 = Date.now();
    const checkBeforeRes = await fetch(`${baseUrl}/payment/check/mission/${targetMissionId}`);
    const checkBeforeDuration = Date.now() - t2;
    const checkBeforeData = await checkBeforeRes.json();

    if (checkBeforeRes.ok && checkBeforeData.success) {
      results.tests.push({
        name: 'Polling Cek Status Pembayaran (Sebelum Bayar)',
        status: 'pass',
        durationMs: checkBeforeDuration,
        details: `Status Terbaca: isPaid=${checkBeforeData.data?.isPaid}, paymentStatus=${checkBeforeData.data?.paymentStatus}`
      });
    }

    // 4. SIMULASI SETTLEMENT / PELUNASAN ESCROW
    const t3 = Date.now();
    const payRes = await fetch(`${baseUrl}/payment/simulate-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'mission',
        entityId: targetMissionId
      })
    });
    const payDuration = Date.now() - t3;
    const payData = await payRes.json();

    if (!payRes.ok || !payData.success) {
      throw new Error(`Simulasi pembayaran gagal (${payRes.status}): ${JSON.stringify(payData)}`);
    }

    results.tests.push({
      name: 'Simulasi Instant Settlement Escrow (Test Mode)',
      status: 'pass',
      durationMs: payDuration,
      details: payData.message || 'Pembayaran escrow sukses dan saldo terkunci'
    });

    // 5. VERIFIKASI TRANSISI STATUS MISI MENJADI OPEN
    const t4 = Date.now();
    const checkAfterRes = await fetch(`${baseUrl}/payment/check/mission/${targetMissionId}`);
    const checkAfterDuration = Date.now() - t4;
    const checkAfterData = await checkAfterRes.json();

    if (checkAfterRes.ok && checkAfterData.data?.isPaid === true) {
      results.tests.push({
        name: 'Verifikasi Transisi Status Misi (OPEN / isPaid: true)',
        status: 'pass',
        durationMs: checkAfterDuration,
        details: `Misi berhasil diaktifkan dengan status: ${checkAfterData.data?.status}`
      });
    } else {
      results.tests.push({
        name: 'Verifikasi Transisi Status Misi',
        status: 'fail',
        durationMs: checkAfterDuration,
        details: `Status belum terupdate: isPaid=${checkAfterData.data?.isPaid}`
      });
      results.status = 'fail';
    }

    results.paymentData = {
      missionId: targetMissionId,
      qris: qrisData.data?.qrString,
      va: vaData.data?.accountNumber,
      isPaid: checkAfterData.data?.isPaid
    };

  } catch (err) {
    results.status = 'fail';
    results.tests.push({
      name: 'Fatal Error Pengujian Pembayaran',
      status: 'fail',
      error: err.message
    });
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

if (process.argv[1]?.endsWith('04-melakukan-pembayaran.js')) {
  testMelakukanPembayaran().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.status === 'pass' ? 0 : 1);
  });
}
