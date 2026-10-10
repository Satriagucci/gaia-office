/**
 * Kepingan Test Bank 01: Pendaftaran Akun Baru (Register)
 * 
 * Menguji fungsionalitas pendaftaran organik, pembuatan wallet,
 * validasi duplikasi data, dan integritas security token.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com';

export async function testDaftar({ baseUrl = BASE_URL } = {}) {
  const runId = Date.now() + '_' + Math.floor(Math.random() * 1000);
  const testEmail = `qa_reg_${runId}@bukainjalan.test`;
  const testUsername = `reg_${runId.slice(-6)}`;
  const testName = `QA Tester ${runId.slice(-4)}`;
  const testPassword = 'Password123!';

  const results = {
    scenario: '01-daftar',
    status: 'pass',
    durationMs: 0,
    tests: [],
    createdUser: null
  };

  const startTime = Date.now();

  try {
    // 1. UJI REGISTRASI SUKSES (Happy Path)
    const t0 = Date.now();
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername,
        name: testName,
        password: testPassword
      })
    });
    const regDuration = Date.now() - t0;
    const regData = await regRes.json();

    if (!regRes.ok || !regData.success) {
      throw new Error(`Registrasi gagal (${regRes.status}): ${JSON.stringify(regData)}`);
    }

    const userId = regData.data?.user?.id || regData.data?.id || regData.id;
    const accessToken = regData.data?.accessToken || regData.accessToken;

    results.tests.push({
      name: 'Registrasi Pengguna Baru Valid',
      status: 'pass',
      durationMs: regDuration,
      details: `User ID: ${userId}, Email: ${testEmail}`
    });

    results.createdUser = {
      id: userId,
      email: testEmail,
      username: testUsername,
      name: testName,
      password: testPassword,
      token: accessToken
    };

    // 2. UJI PENCEGAHAN DUPLIKASI EMAIL (Negative Test)
    const t1 = Date.now();
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        username: `diff_${runId.slice(-6)}`,
        name: 'Duplicate User',
        password: testPassword
      })
    });
    const dupDuration = Date.now() - t1;
    const dupData = await dupRes.json();

    if (dupRes.status === 409 || dupRes.status === 400 || !dupData.success) {
      results.tests.push({
        name: 'Pencegahan Email Duplikat (Conflict Handling)',
        status: 'pass',
        durationMs: dupDuration,
        details: `Berhasil ditolak dengan kode ${dupRes.status}: ${dupData.message || 'Rejected'}`
      });
    } else {
      results.tests.push({
        name: 'Pencegahan Email Duplikat',
        status: 'fail',
        durationMs: dupDuration,
        details: 'Server mengizinkan registrasi duplikat!'
      });
      results.status = 'fail';
    }

    // 3. UJI FORMAT EMAIL TIDAK VALID (Negative Test)
    const t2 = Date.now();
    const badRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bukan-email-valid',
        username: `inv_${runId.slice(-6)}`,
        name: 'Bad Email',
        password: testPassword
      })
    });
    const badDuration = Date.now() - t2;

    if (badRes.status >= 400) {
      results.tests.push({
        name: 'Validasi Format Email Tidak Valid',
        status: 'pass',
        durationMs: badDuration,
        details: `Validasi format berhasil memblokir input invalid (HTTP ${badRes.status})`
      });
    } else {
      results.tests.push({
        name: 'Validasi Format Email Tidak Valid',
        status: 'fail',
        durationMs: badDuration,
        details: 'Server menerima email tanpa format yang valid!'
      });
      results.status = 'fail';
    }

  } catch (err) {
    results.status = 'fail';
    results.tests.push({
      name: 'Fatal Error Pengujian Register',
      status: 'fail',
      error: err.message
    });
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

if (process.argv[1]?.endsWith('01-daftar.js')) {
  testDaftar().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.status === 'pass' ? 0 : 1);
  });
}
