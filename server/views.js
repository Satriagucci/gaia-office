// server/views.js - Premium Modern UI System for GAIA Office & Dev Pipeline

export function renderBaseLayout({ title, activePage, body, scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} • GAIA Hive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --bg-card: rgba(17, 24, 39, 0.7);
      --bg-card-hover: rgba(30, 41, 59, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(56, 189, 248, 0.4);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #0ea5e9;
      --primary-glow: rgba(14, 165, 233, 0.25);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.25);
      --warning: #f59e0b;
      --danger: #ef4444;
      --purple: #8b5cf6;
      --radius: 14px;
      --radius-sm: 8px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: var(--bg);
      background-image: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.12), transparent),
        radial-gradient(ellipse 60% 40% at 90% 100%, rgba(139, 92, 246, 0.08), transparent);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
    }

    /* ── TOP NAVIGATION ── */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      background: rgba(11, 15, 25, 0.85);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .brand-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-badge {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(14, 165, 233, 0.15);
      color: var(--primary);
      border: 1px solid rgba(14, 165, 233, 0.3);
      letter-spacing: 0.5px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-link.active {
      color: #fff;
      background: var(--primary);
      box-shadow: 0 2px 10px var(--primary-glow);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Runner Pill */
    .runner-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 24px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      cursor: pointer;
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s;
    }

    .runner-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .pulse-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--danger);
      position: relative;
    }

    .pulse-dot.online {
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
    }

    .pulse-dot.online::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid var(--success);
      animation: pulse-ring 1.8s infinite;
    }

    @keyframes pulse-ring {
      0% { transform: scale(0.9); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* ── BUTTONS ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-primary {
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: #fff;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .btn-primary:hover {
      box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      box-shadow: 0 4px 14px var(--success-glow);
    }
    .btn-success:hover {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-purple {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: #fff;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--border);
      color: var(--text);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .btn-danger:hover {
      background: var(--danger);
      color: #fff;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 7px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    /* ── CONTAINER ── */
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    /* ── CARDS & GRIDS ── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.25s, box-shadow 0.25s;
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
    }

    /* ── MODALS ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal {
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 28px;
      max-width: 640px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      position: relative;
      animation: modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modal-enter {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Terminal Console */
    .terminal-box {
      background: #030712;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #38bdf8;
      max-height: 320px;
      overflow-y: auto;
    }

    .terminal-box .log-err { color: #f87171; }
    .terminal-box .log-ok { color: #34d399; font-weight: 600; }
    .terminal-box .log-dim { color: #64748b; }

    /* Scrollbars */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

    /* Responsive */
    @media (max-width: 768px) {
      .navbar { padding: 0 16px; }
      .nav-links { display: none; }
      .container { padding: 20px 16px; }
    }
  </style>
</head>
<body>

  <!-- Top Navbar -->
  <nav class="navbar">
    <a href="/" class="nav-brand">
      <div class="brand-icon">🐝</div>
      <div>
        <div class="brand-title">
          GAIA Hive
          <span class="brand-badge">Dev Ops</span>
        </div>
      </div>
    </a>

    <div class="nav-links">
      <a href="/" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
        <span>📊</span> Dashboard
      </a>
      <a href="/apks" class="nav-link ${activePage === 'apks' ? 'active' : ''}">
        <span>📦</span> APK Pipeline
      </a>
      <a href="/screenshots" class="nav-link ${activePage === 'testbank' ? 'active' : ''}">
        <span>🧪</span> Test Bank
      </a>
      <a href="/office" class="nav-link ${activePage === 'office' ? 'active' : ''}" target="_blank">
        <span>🏢</span> Virtual Office ↗
      </a>
    </div>

    <div class="nav-actions">
      <a href="/apks" class="runner-pill" id="globalRunnerPill" title="Status Runner Laptop Satria">
        <span class="pulse-dot" id="globalRunnerDot"></span>
        <span id="globalRunnerText">💻 Runner: Checking...</span>
      </a>
    </div>
  </nav>

  ${body}

  <!-- Global Runner Telemetry Script -->
  <script>
    function updateGlobalRunner(d) {
      const dot = document.getElementById('globalRunnerDot');
      const txt = document.getElementById('globalRunnerText');
      if (!dot || !txt) return;
      if (d && d.online) {
        dot.className = 'pulse-dot online';
        txt.textContent = '💻 ' + (d.device || 'Laptop Online');
      } else {
        dot.className = 'pulse-dot';
        txt.textContent = '💻 Laptop: Offline';
      }
    }

    function syncRunnerStatus() {
      fetch('/api/runner/status')
        .then(r => r.json())
        .then(updateGlobalRunner)
        .catch(() => updateGlobalRunner({ online: false }));
    }

    syncRunnerStatus();
    setInterval(syncRunnerStatus, 4000);

    try {
      const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(wsProto + '//' + location.host + '/chat');
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data);
          if (m.type === 'runner_status') updateGlobalRunner(m);
        } catch {}
      };
    } catch {}
  </script>
  ${scripts}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD VIEW (GET /)
// ─────────────────────────────────────────────────────────────
export function renderDashboardView({ scenarios = [], apks = [], runner = null }) {
  const isRunnerOnline = runner && runner.online;
  const runnerDevice = isRunnerOnline ? runner.device : 'Tidak Terhubung';
  const runnerModel = isRunnerOnline ? (runner.model || 'Android Emulator') : '-';

  const totalApks = apks.length;
  const totalScenarios = scenarios.length;
  const passScenarios = scenarios.filter(s => s.status === 'pass').length;

  const scenarioCardsHtml = scenarios.slice(0, 4).map(s => {
    const statusColor = s.status === 'pass' ? '#10b981' : s.status === 'fail' ? '#ef4444' : '#f59e0b';
    const statusIcon = s.status === 'pass' ? '✅ Pass' : s.status === 'fail' ? '❌ Fail' : '⏳ Pending';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
        <div>
          <div style="font-weight:600;font-size:14px;margin-bottom:2px">${s.name} ${s.hasAutomation ? '🤖' : ''}</div>
          <div style="font-size:11px;color:var(--text-muted)">${s.captures} capture • ${s.lastCapture ? s.lastCapture.slice(0,16).replace('T',' ') : 'Belum di-run'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;font-weight:600;color:${statusColor};background:${statusColor}18;padding:3px 8px;border-radius:6px;border:1px solid ${statusColor}30">${statusIcon}</span>
          <a href="/screenshots/${encodeURIComponent(s.name)}" class="btn btn-secondary btn-sm">Buka ›</a>
        </div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center">Belum ada skenario. Buat skenario baru di Test Bank.</p>';

  const apksTableHtml = apks.slice(0, 3).map(a => {
    const sizeStr = a.size > 1024*1024 ? (a.size/1024/1024).toFixed(1)+' MB' : (a.size/1024).toFixed(0)+' KB';
    const dateStr = a.time ? a.time.slice(0, 16).replace('T', ' ') : '-';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
        <div>
          <div style="font-weight:600;font-size:13px;color:#38bdf8;font-family:'JetBrains Mono',monospace">${a.file}</div>
          <div style="font-size:11px;color:var(--text-muted)">${sizeStr} • ${dateStr}</div>
        </div>
        <div style="display:flex;gap:6px">
          <a href="/apks/${encodeURIComponent(a.file)}" class="btn btn-secondary btn-sm" download>⬇️ Download</a>
        </div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center">Belum ada APK. Klik "Build APK" untuk memulai.</p>';

  const body = `
  <div class="container">
    <!-- Hero Banner -->
    <div style="background:linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.12));border:1px solid rgba(56, 189, 248, 0.25);border-radius:20px;padding:36px;margin-bottom:32px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-40px;right:-30px;font-size:180px;opacity:0.06;pointer-events:none">📱</div>
      <div style="max-width:760px;position:relative;z-index:2">
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(14, 165, 233, 0.15);border:1px solid rgba(14, 165, 233, 0.35);color:#38bdf8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:14px">
          ⚡ BukainJalan Mobile CI/CD & Testing Hub
        </div>
        <h1 style="font-size:32px;font-weight:800;letter-spacing:-0.5px;margin-bottom:12px;line-height:1.25">
          Selamat Datang di Command Center <span style="background:linear-gradient(90deg,#38bdf8,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GAIA Hive</span>
        </h1>
        <p style="color:var(--text-muted);font-size:15px;line-height:1.6;margin-bottom:24px">
          Sistem otomatisasi terpadu: Build APK lokal tanpa kuota EAS cloud, eksekusi automation test ADB di emulator laptop, dan visualisasi virtual office secara real-time.
        </p>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button onclick="openBuildModal('staging')" class="btn btn-success">
            <span>🔨</span> Build APK Staging (0 Quota)
          </button>
          <button onclick="triggerQuickCapture()" class="btn btn-primary" id="quickCapBtn">
            <span>📷</span> Snap Laptop Emulator
          </button>
          <a href="/screenshots" class="btn btn-secondary">
            <span>🧪</span> Buka Test Bank
          </a>
          <a href="/office" class="btn btn-purple" target="_blank">
            <span>🏢</span> Buka Virtual Office
          </a>
        </div>
      </div>
    </div>

    <!-- Telemetry Stats Row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;margin-bottom:32px">
      <!-- Stat 1 -->
      <div class="card" style="padding:18px 20px">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">EAS CLOUD QUOTA</div>
        <div style="font-size:26px;font-weight:800;color:#10b981;display:flex;align-items:center;gap:8px">
          0 / 15 <span style="font-size:12px;font-weight:600;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 8px;border-radius:12px">Hemat 100%</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Diproses di Docker laptop Satria</div>
      </div>

      <!-- Stat 2 -->
      <div class="card" style="padding:18px 20px">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">STATUS LAPTOP RUNNER</div>
        <div style="font-size:22px;font-weight:800;display:flex;align-items:center;gap:8px;color:${isRunnerOnline ? '#10b981' : '#ef4444'}" id="dashRunnerStatus">
          ${isRunnerOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px" id="dashRunnerDevice">${runnerDevice}</div>
      </div>

      <!-- Stat 3 -->
      <div class="card" style="padding:18px 20px">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">APK SIAP PAKAI</div>
        <div style="font-size:26px;font-weight:800;color:#38bdf8">${totalApks} Versi</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Tersimpan di storage VPS</div>
      </div>

      <!-- Stat 4 -->
      <div class="card" style="padding:18px 20px">
        <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">TEST BANK SCENARIOS</div>
        <div style="font-size:26px;font-weight:800;color:#a855f7">${totalScenarios} Skenario</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${passScenarios} skenario terverifikasi lulus</div>
      </div>
    </div>

    <!-- Bento Grid Content -->
    <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:24px">
      
      <!-- Col 1: Runner & Live Emulator Monitor -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>💻</span> Node Runner & Emulator Monitor
          </div>
          <span class="brand-badge" id="dashDeviceBadge">${runnerDevice}</span>
        </div>

        <div style="background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
            <span style="color:var(--text-muted)">Koneksi Pipeline:</span>
            <span style="font-weight:600;color:#38bdf8">WebSocket Outbound (Tailscale)</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
            <span style="color:var(--text-muted)">Emulator Local ADB:</span>
            <span style="font-weight:600" id="dashModelText">${runnerModel}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px">
            <span style="color:var(--text-muted)">Auto SCP Transfer:</span>
            <span style="font-weight:600;color:#10b981">deploy@76.13.21.10:2222 (Aktif)</span>
          </div>
        </div>

        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:13px;font-weight:600">📸 Layar Terakhir Emulator</span>
            <span style="font-size:11px;color:var(--text-muted)">Klik gambar untuk zoom</span>
          </div>
          <div style="position:relative;background:#030712;border:1px solid var(--border);border-radius:12px;overflow:hidden;max-height:280px;display:flex;align-items:center;justify-content:center">
            <img id="liveEmulatorPreview" src="/screenshots/laundry-pickup/latest.png" style="width:100%;max-height:280px;object-fit:contain;cursor:zoom-in" onerror="this.src='/master-map.png'" onclick="openZoomModal(this.src)">
          </div>
        </div>

        <div style="display:flex;gap:8px">
          <button onclick="triggerQuickCapture()" class="btn btn-primary btn-sm" style="flex:1">
            📷 Ambil Screenshot Baru
          </button>
          <a href="/screenshots/laundry-pickup" class="btn btn-secondary btn-sm">
            Buka Skenario Lengkap →
          </a>
        </div>
      </div>

      <!-- Col 2: Test Bank & APKs -->
      <div style="display:flex;flex-direction:column;gap:24px">
        
        <!-- Skenario Testing -->
        <div class="card" style="flex:1">
          <div class="card-header">
            <div class="card-title">
              <span>🧪</span> Test Bank Scenarios
            </div>
            <a href="/screenshots" class="btn btn-secondary btn-sm">Lihat Semua →</a>
          </div>
          <div>
            ${scenarioCardsHtml}
          </div>
        </div>

        <!-- APKs -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>📦</span> Build APK Pipeline (0 Quota)
            </div>
            <a href="/apks" class="btn btn-secondary btn-sm">Kelola APK →</a>
          </div>
          <div>
            ${apksTableHtml}
          </div>
        </div>

      </div>

    </div>

    <!-- Virtual Office Promo Card -->
    <div class="card" style="margin-top:24px;background:linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));border:1px solid rgba(139, 92, 246, 0.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:18px">
          <div style="width:56px;height:56px;border-radius:14px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);display:flex;align-items:center;justify-content:center;font-size:28px">
            🏢
          </div>
          <div>
            <h3 style="font-size:17px;font-weight:700;margin-bottom:4px">Virtual Office Pixel Art (11 Ruangan)</h3>
            <p style="color:var(--text-muted);font-size:13px">
              Jelajahi kantor visual tim BukainJalan: GAIA, Alya, Rani, Dina, Laras. Pantau chat Slack internal real-time.
            </p>
          </div>
        </div>
        <a href="/office" target="_blank" class="btn btn-purple">
          Masuk ke Kantor Virtual ↗
        </a>
      </div>
    </div>
  </div>

  <!-- Build Live Modal -->
  <div id="buildModal" class="modal-overlay" onclick="if(event.target===this)closeBuildModal()">
    <div class="modal">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="font-size:18px;font-weight:700" id="buildModalTitle">🔨 Build Pipeline di Laptop Satria</h2>
        <button onclick="closeBuildModal()" class="btn btn-secondary btn-sm">✕ Tutup</button>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">
        Proses build berjalan secara lokal di laptop Satria (0 kuota EAS), lalu ditransfer otomatis via SCP ke VPS.
      </p>
      <div id="buildModalConsole" class="terminal-box">Menunggu instruksi build...</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
        <button onclick="closeBuildModal()" class="btn btn-secondary">Tutup</button>
      </div>
    </div>
  </div>

  <!-- Zoom Lightbox Modal -->
  <div id="zoomModal" class="modal-overlay" onclick="this.classList.remove('active')">
    <img id="zoomModalImg" src="" style="max-width:92vw;max-height:92vh;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,0.8);object-fit:contain">
  </div>
  `;

  const scripts = `
  <script>
    let buildEventSource = null;

    function openZoomModal(src) {
      const modal = document.getElementById('zoomModal');
      const img = document.getElementById('zoomModalImg');
      img.src = src;
      modal.classList.add('active');
    }

    function openBuildModal(profile) {
      const modal = document.getElementById('buildModal');
      const consoleBox = document.getElementById('buildModalConsole');
      const title = document.getElementById('buildModalTitle');
      title.textContent = '🔨 Build Pipeline (' + profile.toUpperCase() + ') - 0 EAS Quota';
      consoleBox.innerHTML = '<div class="log-dim">[' + new Date().toLocaleTimeString() + '] Menghubungkan ke Laptop Runner...</div>';
      modal.classList.add('active');

      if (buildEventSource) buildEventSource.close();
      buildEventSource = new EventSource('/api/apks/build?profile=' + profile + '&target=laptop');

      buildEventSource.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const line = document.createElement('div');
          if (d.type === 'error') line.className = 'log-err';
          else if (d.type === 'done') line.className = 'log-ok';
          else line.className = 'log-dim';
          line.textContent = '[' + (d.ts || new Date().toLocaleTimeString()) + '] ' + (d.message || d.type);
          consoleBox.appendChild(line);
          consoleBox.scrollTop = consoleBox.scrollHeight;

          if (d.type === 'done' || d.type === 'error') {
            buildEventSource.close();
          }
        } catch {}
      };

      buildEventSource.onerror = function() {
        const line = document.createElement('div');
        line.className = 'log-err';
        line.textContent = 'Koneksi ke build runner terputus atau offline.';
        consoleBox.appendChild(line);
      };
    }

    function closeBuildModal() {
      document.getElementById('buildModal').classList.remove('active');
      if (buildEventSource) {
        buildEventSource.close();
        buildEventSource = null;
      }
    }

    async function triggerQuickCapture() {
      const btn = document.getElementById('quickCapBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Mengambil Screen...';
      }
      try {
        await fetch('/capture?scenario=laundry-pickup&target=laptop');
        const img = document.getElementById('liveEmulatorPreview');
        if (img) img.src = '/screenshots/laundry-pickup/latest.png?t=' + Date.now();
      } catch (e) {
        alert('Gagal mengambil screenshot: ' + e.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>📷</span> Snap Laptop Emulator';
        }
      }
    }
  </script>
  `;

  return renderBaseLayout({
    title: 'Command Center & Testing Hub',
    activePage: 'dashboard',
    body,
    scripts
  });
}

// ─────────────────────────────────────────────────────────────
// APK MANAGER VIEW (GET /apks)
// ─────────────────────────────────────────────────────────────
export function renderApksView() {
  const body = `
  <div class="container">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.5px">📦 APK Build & Release Pipeline</h1>
        <p style="color:var(--text-muted);font-size:14px">Build aplikasi secara lokal di Docker laptop Satria tanpa menghabiskan kuota cloud EAS (15/bulan).</p>
      </div>
      <div style="display:flex;gap:8px">
        <a href="/screenshots" class="btn btn-secondary">🧪 Buka Test Bank</a>
      </div>
    </div>

    <!-- Build Controls Card -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-header">
        <div class="card-title">
          <span>🔨</span> Trigger Build Baru (0 EAS Quota)
        </div>
        <span class="brand-badge">Local Engine</span>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        Build dijalankan di laptop secara lokal menggunakan <code style="color:#38bdf8;font-family:'JetBrains Mono'">build-local.ps1</code>. APK yang berhasil dibuild akan otomatis di-transfer via SCP ke direktori release VPS ini.
      </p>

      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
        <button onclick="startApkBuild('staging')" class="btn btn-success" id="btnBuildStaging">
          🔨 Build Staging (Laptop)
        </button>
        <button onclick="startApkBuild('production')" class="btn btn-primary" id="btnBuildProd">
          🔨 Build Production (Laptop)
        </button>
      </div>

      <div id="buildConsole" class="terminal-box" style="display:none"></div>
    </div>

    <!-- APK List Table Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>📋</span> Daftar Versi APK
        </div>
        <button onclick="loadApksList()" class="btn btn-secondary btn-sm">🔄 Refresh List</button>
      </div>
      
      <div id="apksTableContainer">
        <p style="color:var(--text-muted);padding:30px 0;text-align:center">Memuat daftar APK...</p>
      </div>
    </div>
  </div>
  `;

  const scripts = `
  <script>
    let sseSource = null;

    async function loadApksList() {
      const container = document.getElementById('apksTableContainer');
      try {
        const r = await fetch('/api/apks');
        const d = await r.json();
        if (!d.apks || d.apks.length === 0) {
          container.innerHTML = '<p style="color:var(--text-muted);padding:30px 0;text-align:center">Belum ada file APK. Klik "Build" di atas untuk membuat build pertama.</p>';
          return;
        }

        let html = '<div style="display:flex;flex-direction:column;gap:8px">';
        d.apks.forEach(a => {
          const date = a.time ? a.time.slice(0, 16).replace('T', ' ') : '-';
          const size = a.size > 1024*1024 ? (a.size/1024/1024).toFixed(1)+' MB' : (a.size/1024).toFixed(0)+' KB';
          html += \`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;gap:16px;flex-wrap:wrap">
              <div>
                <div style="font-weight:700;font-size:15px;color:#38bdf8;font-family:'JetBrains Mono',monospace">\${a.file}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Ukuran: \${size} • Dibuat: \${date}</div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-success btn-sm" data-file="\${a.file}" onclick="installApkToEmulator(this.dataset.file)">
                  📲 Install ke Emulator
                </button>
                <a href="/apks/\${encodeURIComponent(a.file)}" class="btn btn-secondary btn-sm" download>
                  ⬇️ Download
                </a>
              </div>
            </div>
          \`;
        });
        html += '</div>';
        container.innerHTML = html;
      } catch (e) {
        container.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center">Gagal memuat list: ' + e.message + '</p>';
      }
    }

    async function installApkToEmulator(file) {
      const btn = event.target;
      const oldTxt = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Menginstall...';
      try {
        const r = await fetch('/api/apks/install', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ file })
        });
        const d = await r.json();
        if (d.ok) {
          alert('✅ Sukses terinstall ke emulator laptop!');
        } else {
          alert('❌ Gagal install: ' + (d.error || 'Unknown error'));
        }
      } catch (e) {
        alert('❌ Error: ' + e.message);
      } finally {
        btn.disabled = false;
        btn.textContent = oldTxt;
      }
    }

    function startApkBuild(profile) {
      const con = document.getElementById('buildConsole');
      const bStaging = document.getElementById('btnBuildStaging');
      const bProd = document.getElementById('btnBuildProd');
      con.style.display = 'block';
      con.innerHTML = '<div class="log-dim">[' + new Date().toLocaleTimeString() + '] Mengirim perintah build (' + profile + ') ke laptop runner...</div>';
      bStaging.disabled = true;
      bProd.disabled = true;

      if (sseSource) sseSource.close();
      sseSource = new EventSource('/api/apks/build?profile=' + profile + '&target=laptop');

      sseSource.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const line = document.createElement('div');
          if (d.type === 'error') line.className = 'log-err';
          else if (d.type === 'done') line.className = 'log-ok';
          else line.className = 'log-dim';
          line.textContent = '[' + (d.ts || new Date().toLocaleTimeString()) + '] ' + (d.message || d.type);
          con.appendChild(line);
          con.scrollTop = con.scrollHeight;

          if (d.type === 'done' || d.type === 'error') {
            sseSource.close();
            bStaging.disabled = false;
            bProd.disabled = false;
            loadApksList();
          }
        } catch {}
      };

      sseSource.onerror = function() {
        bStaging.disabled = false;
        bProd.disabled = false;
      };
    }

    loadApksList();
  </script>
  `;

  return renderBaseLayout({
    title: 'APK Pipeline & Releases',
    activePage: 'apks',
    body,
    scripts
  });
}

// ─────────────────────────────────────────────────────────────
// TEST BANK VIEW (GET /screenshots)
// ─────────────────────────────────────────────────────────────
export function renderTestBankView({ scenarios = [] }) {
  const cardsHtml = scenarios.map(s => {
    const statusColor = s.status === 'pass' ? '#10b981' : s.status === 'fail' ? '#ef4444' : '#f59e0b';
    const statusIcon = s.status === 'pass' ? '✅' : s.status === 'fail' ? '❌' : '⏳';
    const lastTime = s.captures > 0 && s.lastCapture ? s.lastCapture.slice(0, 16).replace('T', ' ') : '-';
    return `
      <a href="/screenshots/${encodeURIComponent(s.name)}" style="text-decoration:none;color:inherit">
        <div class="card" style="display:flex;align-items:center;gap:18px;padding:18px 22px">
          <div style="width:48px;height:48px;border-radius:12px;background:${statusColor}18;border:1px solid ${statusColor}35;display:flex;align-items:center;justify-content:center;font-size:22px;color:${statusColor};flex-shrink:0">
            ${statusIcon}
          </div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:3px">${s.name} ${s.hasAutomation ? '🤖' : ''}</div>
            <div style="font-size:12px;color:var(--text-muted)">${s.captures} screenshot • ${s.status.toUpperCase()} • ${lastTime}</div>
          </div>
          <div style="font-size:20px;color:var(--text-muted)">›</div>
        </div>
      </a>
    `;
  }).join('');

  const body = `
  <div class="container" style="max-width:960px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.5px">🧪 Test Bank & Automation</h1>
        <p style="color:var(--text-muted);font-size:14px">Kumpulan skenario pengujian mobile flow BukainJalan dengan integrasi ADB.</p>
      </div>
      <div>
        <button onclick="document.getElementById('newScenarioModal').classList.add('active')" class="btn btn-primary">
          + Scenario Baru
        </button>
      </div>
    </div>

    ${scenarios.length > 0 ? `<div style="display:flex;flex-direction:column;gap:12px">${cardsHtml}</div>` : `
      <div class="card" style="text-align:center;padding:60px 20px">
        <div style="font-size:48px;margin-bottom:12px">🧪</div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:6px">Belum Ada Skenario Testing</h3>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px">Buat skenario pertama untuk mulai menguji dan mendokumentasikan fitur aplikasi.</p>
        <button onclick="document.getElementById('newScenarioModal').classList.add('active')" class="btn btn-primary">+ Buat Skenario Baru</button>
      </div>
    `}
  </div>

  <!-- New Scenario Modal -->
  <div id="newScenarioModal" class="modal-overlay" onclick="if(event.target===this)this.classList.remove('active')">
    <div class="modal">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">📋 Buat Skenario Testing Baru</h2>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">GAIA akan membuatkan file skenario dan template script yang dapat kamu edit.</p>
      <input type="text" id="newScenarioName" placeholder="Nama skenario (contoh: cari-tukang)" style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:9px;background:rgba(0,0,0,0.3);color:#fff;font-size:14px;outline:none;margin-bottom:18px">
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-secondary" onclick="document.getElementById('newScenarioModal').classList.remove('active')">Batal</button>
        <button class="btn btn-primary" onclick="createScenarioSubmit()">Buat Skenario</button>
      </div>
    </div>
  </div>
  `;

  const scripts = `
  <script>
    async function createScenarioSubmit() {
      const name = document.getElementById('newScenarioName').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,'');
      if (!name) return alert('Silakan isi nama skenario!');
      const r = await fetch('/api/scenarios/' + encodeURIComponent(name) + '/script', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          content: '# ' + name + '\\n\\n## Status\\n⏳ Pending\\n\\n## Deskripsi\\nPengujian flow ' + name + '\\n\\n## Steps\\n1. Buka aplikasi BukainJalan\\n2. Verifikasi tampilan layar utama\\n\\n## Expected Result\\n- Aplikasi terbuka tanpa crash\\n'
        })
      });
      if (r.ok) location.href = '/screenshots/' + encodeURIComponent(name);
      else alert('Gagal membuat skenario');
    }
  </script>
  `;

  return renderBaseLayout({
    title: 'Test Bank',
    activePage: 'testbank',
    body,
    scripts
  });
}

// ─────────────────────────────────────────────────────────────
// SCENARIO DETAIL VIEW (GET /screenshots/:scenario)
// ─────────────────────────────────────────────────────────────
export function renderScenarioDetailView({ scenario, caps = [], md = '', yaml = '', status = 'pending', runner = null }) {
  const statusColor = status === 'pass' ? '#10b981' : status === 'fail' ? '#ef4444' : '#f59e0b';
  const statusIcon = status === 'pass' ? '✅ PASS' : status === 'fail' ? '❌ FAIL' : '⏳ PENDING';

  const captureCardsHtml = caps.filter(f => f.name !== 'latest.png').map(f => {
    const t = f.name.replace('.png','').replace(/[-]/g,':').replace(':','-',1);
    const sizeStr = f.size > 1024*1024 ? (f.size/1024/1024).toFixed(1)+' MB' : (f.size/1024).toFixed(0)+' KB';
    return `
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;overflow:hidden;position:relative">
        <div style="cursor:zoom-in;background:#030712;display:flex;align-items:center;justify-content:center" onclick="openZoomModal('/screenshots/${encodeURIComponent(scenario)}/${f.name}')">
          <img src="/screenshots/${encodeURIComponent(scenario)}/${f.name}" loading="lazy" style="width:100%;aspect-ratio:411/731;object-fit:cover;display:block">
        </div>
        <div style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-muted)">
          <span>\${t}</span>
          <span>\${sizeStr}</span>
        </div>
        <a href="/screenshots/${encodeURIComponent(scenario)}/delete-file?file=\${f.name}" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.6);color:#fff;width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px" onclick="return confirm('Hapus screenshot ini?')">✕</a>
      </div>
    `;
  }).join('');

  const body = `
  <div class="container">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <a href="/screenshots" class="btn btn-secondary btn-sm">‹ Kembali ke Test Bank</a>
        <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#fff">${scenario}</h1>
        <span style="font-size:12px;font-weight:700;color:${statusColor};background:${statusColor}18;padding:4px 10px;border-radius:8px;border:1px solid ${statusColor}35">
          ${statusIcon}
        </span>
        <span style="font-size:13px;color:var(--text-muted)">${caps.length} captures</span>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a href="/capture?scenario=${encodeURIComponent(scenario)}&target=laptop" class="btn btn-primary btn-sm" title="Capture dari Emulator Laptop">
          📷 Snap Laptop
        </a>
        <button class="btn btn-success btn-sm" onclick="runAutomation('laptop')" id="btnRunLaptop">
          ▶ Run di Laptop
        </button>
        <button class="btn btn-secondary btn-sm" onclick="runAutomation('vps')" id="btnRunVps">
          ▶ Run di VPS
        </button>
        <a href="/screenshots/${encodeURIComponent(scenario)}/delete" class="btn btn-danger btn-sm" onclick="return confirm('Hapus seluruh skenario ${scenario}?')">
          🗑 Hapus
        </a>
      </div>
    </div>

    <!-- Runner Progress Panel (SSE) -->
    <div id="runnerPanel" class="card" style="margin-bottom:24px;display:none">
      <div class="card-header">
        <div class="card-title">
          <span>▶</span> Automation Execution Progress
        </div>
        <span id="runStatusText" style="font-size:13px;color:#38bdf8;font-weight:600">⏳ Memulai...</span>
      </div>

      <div style="background:rgba(255,255,255,0.06);border-radius:10px;height:12px;overflow:hidden;margin-bottom:12px">
        <div id="progressBar" style="width:0%;height:100%;background:linear-gradient(90deg,#0ea5e9,#10b981);transition:width 0.3s ease"></div>
      </div>

      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:14px">
        <span id="progressStepCount">0 / 0 steps</span>
        <span id="progressShotCount">0 screenshots tersimpan</span>
      </div>

      <div id="stepLogContainer" class="terminal-box" style="margin-bottom:12px"></div>
      <button class="btn btn-danger btn-sm" onclick="stopAutomation()" id="btnStopRun" style="display:none">⏹ Batalkan Test</button>
    </div>

    <!-- Layout: 2 Columns (Script on Left, Captures on Right) -->
    <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:24px;align-items:start">
      
      <!-- Script Editor -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>📋</span> Scenario Test Script (Markdown)
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span id="saveStatus" style="font-size:12px;color:#10b981;opacity:0;transition:opacity 0.25s">✓ Tersimpan</span>
            <button onclick="saveScriptDirect()" class="btn btn-primary btn-sm">💾 Simpan</button>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">
          Tuliskan langkah-langkah di bawah heading <code>## Steps</code> (contoh: <code>1. Buka halaman</code>). Runner akan mengeksekusi step tersebut secara berurutan.
        </p>
        <textarea id="editorArea" style="width:100%;min-height:420px;background:#030712;color:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.6;resize:vertical;outline:none">${md || ''}</textarea>
      </div>

      <!-- Screenshot Gallery -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>📸</span> Screenshots & Artifacts
          </div>
          <a href="/capture?scenario=${encodeURIComponent(scenario)}&target=laptop" class="btn btn-secondary btn-sm">+ Ambil Foto</a>
        </div>
        
        ${caps.length === 0 ? '<p style="color:var(--text-muted);padding:40px 0;text-align:center;font-size:13px">Belum ada screenshot. Klik tombol di atas untuk mengambil layar emulator.</p>' : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:12px">
            ${captureCardsHtml}
          </div>
        `}
      </div>

    </div>
  </div>

  <!-- Zoom Modal -->
  <div id="zoomModal" class="modal-overlay" onclick="this.classList.remove('active')">
    <img id="zoomModalImg" src="" style="max-width:92vw;max-height:92vh;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,0.8);object-fit:contain">
  </div>
  `;

  const scripts = `
  <script>
    function openZoomModal(src) {
      const modal = document.getElementById('zoomModal');
      const img = document.getElementById('zoomModalImg');
      img.src = src;
      modal.classList.add('active');
    }

    // Auto-save script
    let saveTimeout = null;
    const editor = document.getElementById('editorArea');
    if (editor) {
      editor.addEventListener('input', () => {
        document.getElementById('saveStatus').style.opacity = '0';
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveScriptDirect, 1800);
      });
    }

    async function saveScriptDirect() {
      const content = document.getElementById('editorArea').value;
      const r = await fetch('/api/scenarios/${encodeURIComponent(scenario)}/script', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content })
      });
      if (r.ok) {
        const ind = document.getElementById('saveStatus');
        ind.style.opacity = '1';
        setTimeout(() => ind.style.opacity = '0', 2500);
      }
    }

    // Automation Runner via SSE
    let runEventSource = null;
    let isRunning = false;

    function runAutomation(target = 'laptop') {
      if (isRunning) return;
      isRunning = true;

      const pnl = document.getElementById('runnerPanel');
      const pBar = document.getElementById('progressBar');
      const sText = document.getElementById('runStatusText');
      const logBox = document.getElementById('stepLogContainer');
      const btnStop = document.getElementById('btnStopRun');
      const bLaptop = document.getElementById('btnRunLaptop');
      const bVps = document.getElementById('btnRunVps');

      pnl.style.display = 'block';
      pBar.style.width = '0%';
      sText.textContent = '⏳ Menjalankan di ' + target + '...';
      sText.style.color = '#38bdf8';
      logBox.innerHTML = '<div class="log-dim">[' + new Date().toLocaleTimeString() + '] Menyiapkan ADB runner...</div>';
      if (btnStop) btnStop.style.display = 'inline-flex';
      if (bLaptop) bLaptop.disabled = true;
      if (bVps) bVps.disabled = true;

      if (runEventSource) runEventSource.close();
      runEventSource = new EventSource('/screenshots/${encodeURIComponent(scenario)}/run?target=' + target);

      runEventSource.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          
          if (d.type === 'progress') {
            pBar.style.width = d.percent + '%';
            document.getElementById('progressStepCount').textContent = d.current + ' / ' + d.total + ' steps';
          }
          else if (d.type === 'step') {
            const line = document.createElement('div');
            line.className = d.status === 'pass' ? 'log-ok' : 'log-err';
            line.textContent = (d.status === 'pass' ? '✅ ' : '❌ ') + (d.name || 'Step selesai');
            logBox.appendChild(line);
            logBox.scrollTop = logBox.scrollHeight;
          }
          else if (d.type === 'info') {
            const line = document.createElement('div');
            line.className = 'log-dim';
            line.textContent = 'ℹ️ ' + d.message;
            logBox.appendChild(line);
          }
          else if (d.type === 'result') {
            pBar.style.width = '100%';
            sText.textContent = (d.status === 'pass' ? '✅ ' : '❌ ') + d.message;
            sText.style.color = d.status === 'pass' ? '#10b981' : '#ef4444';
            finishRun();
          }
          else if (d.type === 'error') {
            sText.textContent = '❌ ' + d.message;
            sText.style.color = '#ef4444';
            finishRun();
          }
        } catch {}
      };

      runEventSource.onerror = function() {
        sText.textContent = '❌ Koneksi terputus';
        finishRun();
      };
    }

    function finishRun() {
      isRunning = false;
      if (runEventSource) {
        runEventSource.close();
        runEventSource = null;
      }
      const btnStop = document.getElementById('btnStopRun');
      const bLaptop = document.getElementById('btnRunLaptop');
      const bVps = document.getElementById('btnRunVps');
      if (btnStop) btnStop.style.display = 'none';
      if (bLaptop) bLaptop.disabled = false;
      if (bVps) bVps.disabled = false;
    }

    function stopAutomation() {
      finishRun();
      document.getElementById('runStatusText').textContent = '⏹ Dibatalkan';
    }
  </script>
  `;

  return renderBaseLayout({
    title: scenario + ' • Test Bank',
    activePage: 'testbank',
    body,
    scripts
  });
}

