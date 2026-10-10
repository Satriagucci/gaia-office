/**
 * Kepingan Test Bank 02: Masuk Akun & Otentikasi (Login)
 * 
 * Menguji login dengan kredensial valid, penolakan password salah,
 * dan verifikasi keabsahan JWT Token pada endpoint terproteksi.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com';

export async function testLogin({ baseUrl = BASE_URL, user = null } = {}) {
  const results = {
    scenario: '02-login',
    status: 'pass',
    durationMs: 0,
    tests: [],
    session: null
  };

  const startTime = Date.now();

  try {
    let testEmail = user?.email;
    let testPassword = user?.password || 'Password123!';

    // Jika user tidak dipass dari skenario 1, buat akun sementara cepat
    if (!testEmail) {
      const tempId = Date.now().toString().slice(-6);
      testEmail = `qa_login_temp_${tempId}@bukainjalan.test`;
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          username: `log_${tempId}`,
          name: `QA Login Bot`,
          password: testPassword
        })
      });
      if (!regRes.ok) throw new Error('Gagal menyiapkan akun dummy untuk test login');
    }

    // 1. UJI PASSWORD SALAH (Negative Test)
    const t0 = Date.now();
    const wrongRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'PasswordSalah999!'
      })
    });
    const wrongDuration = Date.now() - t0;
    const wrongData = await wrongRes.json();

    if (wrongRes.status === 401 || wrongRes.status === 400 || !wrongData.success) {
      results.tests.push({
        name: 'Penolakan Password Salah',
        status: 'pass',
        durationMs: wrongDuration,
        details: `Berhasil ditolak dengan kode ${wrongRes.status}: ${wrongData.message || 'Unauthorized'}`
      });
    } else {
      results.tests.push({
        name: 'Penolakan Password Salah',
        status: 'fail',
        durationMs: wrongDuration,
        details: 'Server meloloskan login dengan password salah!'
      });
      results.status = 'fail';
    }

    // 2. UJI LOGIN BERHASIL (Happy Path)
    const t1 = Date.now();
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginDuration = Date.now() - t1;
    const loginData = await loginRes.json();

    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Login valid gagal (${loginRes.status}): ${JSON.stringify(loginData)}`);
    }

    const token = loginData.data?.accessToken || loginData.accessToken || loginData.token;
    if (!token) throw new Error('Token JWT tidak ditemukan pada respon login');

    results.tests.push({
      name: 'Otentikasi Login Valid',
      status: 'pass',
      durationMs: loginDuration,
      details: `Token JWT berhasil diterbitkan (${token.slice(0, 20)}...)`
    });

    // 3. UJI VERIFIKASI TOKEN KE ENDPOINT TERPROTEKSI (/screens/profile)
    const t2 = Date.now();
    const profRes = await fetch(`${baseUrl}/screens/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profDuration = Date.now() - t2;
    const profData = await profRes.json();

    if (profRes.ok && profData.success !== false) {
      results.tests.push({
        name: 'Verifikasi Token pada Rute Terproteksi',
        status: 'pass',
        durationMs: profDuration,
        details: 'Token berhasil mengakses layout profil terproteksi'
      });
    } else {
      results.tests.push({
        name: 'Verifikasi Token pada Rute Terproteksi',
        status: 'fail',
        durationMs: profDuration,
        details: `Gagal akses profil dengan token (${profRes.status})`
      });
      results.status = 'fail';
    }

    results.session = {
      email: testEmail,
      token
    };

  } catch (err) {
    results.status = 'fail';
    results.tests.push({
      name: 'Fatal Error Pengujian Login',
      status: 'fail',
      error: err.message
    });
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

if (process.argv[1]?.endsWith('02-login.js')) {
  testLogin().then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.status === 'pass' ? 0 : 1);
  });
}
