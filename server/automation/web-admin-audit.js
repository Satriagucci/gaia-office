/**
 * GAIA Web Automation Module (Playwright)
 * 
 * Melakukan pengujian otomatis web portal BukainJalan (Landing Page & Admin Portal)
 * mencakup inspeksi elemen, pengukuran waktu muat halaman, dan tangkapan layar.
 */

import { chromium } from 'playwright'

export async function runWebAutomationAudit({
  landingUrl = 'https://bukainjalan.com',
  adminUrl = 'https://admin.bukainjalan.com',
  headless = true
} = {}) {
  const result = {
    timestamp: new Date().toISOString(),
    pages: [],
    screenshots: [],
    success: true,
    error: null
  }

  let browser = null
  try {
    browser = await chromium.launch({ channel: 'chrome', headless })
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GAIA-Automated-QA/1.0'
    })

    // ──────────────────────────────────────────────
    // 1. AUDIT LANDING PAGE
    // ──────────────────────────────────────────────
    const pageLanding = await context.newPage()
    const t0 = Date.now()
    await pageLanding.goto(landingUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
    const landingLoadMs = Date.now() - t0
    const landingTitle = await pageLanding.title()

    // Ambil screenshot Landing Page
    const landingBuf = await pageLanding.screenshot({ fullPage: false })
    result.screenshots.push({
      name: 'web-landing-page.png',
      buffer: landingBuf,
      base64: landingBuf.toString('base64'),
      description: `Landing Page: ${landingTitle}`
    })

    result.pages.push({
      url: landingUrl,
      title: landingTitle,
      loadTimeMs: landingLoadMs,
      status: 'pass'
    })
    await pageLanding.close()

    // ──────────────────────────────────────────────
    // 2. AUDIT ADMIN PORTAL
    // ──────────────────────────────────────────────
    const pageAdmin = await context.newPage()
    const t1 = Date.now()
    try {
      await pageAdmin.goto(adminUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
      const adminLoadMs = Date.now() - t1
      const adminTitle = await pageAdmin.title()

      // Periksa form login input jika ada
      const hasInputs = await pageAdmin.locator('input').count() > 0

      const adminBuf = await pageAdmin.screenshot({ fullPage: false })
      result.screenshots.push({
        name: 'web-admin-portal.png',
        buffer: adminBuf,
        base64: adminBuf.toString('base64'),
        description: `Admin Portal: ${adminTitle} (Form input: ${hasInputs ? 'Ready' : 'None'})`
      })

      result.pages.push({
        url: adminUrl,
        title: adminTitle,
        loadTimeMs: adminLoadMs,
        hasInputs,
        status: 'pass'
      })
    } catch (adminErr) {
      result.pages.push({
        url: adminUrl,
        status: 'warning',
        error: adminErr.message
      })
    }
    await pageAdmin.close()

  } catch (err) {
    result.success = false
    result.error = err.message
  } finally {
    if (browser) await browser.close()
  }

  return result
}

// Standalone CLI runner
if (process.argv[1]?.endsWith('web-admin-audit.js')) {
  console.log('Menjalankan GAIA Playwright Web Audit...')
  runWebAutomationAudit()
    .then(r => {
      console.log('Hasil Web Audit:', JSON.stringify({ success: r.success, pages: r.pages, screenshots: r.screenshots.map(s => s.name) }, null, 2))
    })
    .catch(e => console.error('Audit failed:', e))
}
