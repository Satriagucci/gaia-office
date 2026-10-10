/**
 * GAIA Organic User Lifecycle & Performance Simulator
 * 
 * Mensimulasikan lifecycle user secara organik melalui REST API resmi (Black-box),
 * tanpa direct SQL injection, sekaligus mencatat benchmark performa & latensi.
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api-staging.bukainjalan.com'

export async function runOrganicUserSimulation({ prefix = 'qa_bot', iterations = 1 } = {}) {
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalSimulations: iterations,
    passed: 0,
    failed: 0,
    metrics: {
      avgRegisterMs: 0,
      avgLoginMs: 0,
      avgHomeSduiMs: 0,
      avgProfileSduiMs: 0,
    },
    logs: [],
  }

  const times = { register: [], login: [], home: [], profile: [] }

  for (let i = 0; i < iterations; i++) {
    const runId = Date.now() + '_' + Math.floor(Math.random() * 1000)
    const email = `${prefix}_${runId}@bukainjalan.test`
    const username = `${prefix}_${runId.slice(-6)}`
    const name = `QA User ${runId.slice(-4)}`
    const password = 'Password123!'

    const log = (msg) => results.logs.push(`[Bot ${i + 1}] ${msg}`)
    log(`Memulai simulasi lifecycle untuk user organik: ${username} (${email})`)

    try {
      // 1. ORGANIC REGISTRATION
      const t0 = Date.now()
      const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, name, password })
      })
      const regTime = Date.now() - t0
      times.register.push(regTime)

      const regData = await regRes.json()
      if (!regRes.ok) {
        throw new Error(`Register gagal (${regRes.status}): ${JSON.stringify(regData)}`)
      }
      log(`✓ Registrasi berhasil (${regTime}ms). User ID: ${regData.data?.id || regData.id || 'ok'}`)

      // 2. LOGIN
      const t1 = Date.now()
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const loginTime = Date.now() - t1
      times.login.push(loginTime)

      const loginData = await loginRes.json()
      if (!loginRes.ok) {
        throw new Error(`Login gagal (${loginRes.status}): ${JSON.stringify(loginData)}`)
      }

      const token = loginData.data?.accessToken || loginData.accessToken || loginData.token
      log(`✓ Login berhasil (${loginTime}ms). Token diperoleh.`)

      // 3. FETCH HOME SDUI LAYOUT
      const t2 = Date.now()
      const homeRes = await fetch(`${BASE_URL}/screens/home`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const homeTime = Date.now() - t2
      times.home.push(homeTime)
      const homeData = await homeRes.json()
      const sectionCount = homeData.sections?.length || homeData.data?.sections?.length || 0
      log(`✓ Fetch Home SDUI berhasil (${homeTime}ms). ${sectionCount} sections termuat.`)

      // 4. FETCH PROFILE SDUI LAYOUT
      const t3 = Date.now()
      const profRes = await fetch(`${BASE_URL}/screens/profile`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const profTime = Date.now() - t3
      times.profile.push(profTime)
      const profData = await profRes.json()
      log(`✓ Fetch Profile SDUI berhasil (${profTime}ms).`)

      results.passed++
    } catch (err) {
      log(`✗ Error: ${err.message}`)
      results.failed++
    }
  }

  // Calculate averages
  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  results.metrics.avgRegisterMs = avg(times.register)
  results.metrics.avgLoginMs = avg(times.login)
  results.metrics.avgHomeSduiMs = avg(times.home)
  results.metrics.avgProfileSduiMs = avg(times.profile)

  return results
}

// CLI execution direct runner
if (process.argv[1]?.endsWith('organic-user.js')) {
  console.log('Menjalankan GAIA Organic User Simulator...')
  runOrganicUserSimulation({ iterations: 1 })
    .then(res => {
      console.log('\n--- HASIL SIMULASI ---')
      console.log(`Passed: ${res.passed}/${res.totalSimulations}`)
      console.log('Metrik Performa:', res.metrics)
      console.log('\nLog Eksekusi:')
      res.logs.forEach(l => console.log(l))
    })
    .catch(err => console.error('Simulator crashed:', err))
}
