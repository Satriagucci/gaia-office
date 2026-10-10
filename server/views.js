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

    /* ── JENKINS PIPELINE & STAGE VIEW STYLES ── */
    .jenkins-pipeline-card {
      background: #0b1329;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: var(--radius);
      padding: 22px;
      margin-bottom: 24px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
      position: relative;
    }

    .jenkins-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }

    .jenkins-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .jenkins-weather {
      font-size: 26px;
      line-height: 1;
    }

    .jenkins-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.5px;
    }
    .jenkins-badge.blue {
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.3);
    }
    .jenkins-badge.green {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .jenkins-badge.red {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .jenkins-timer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.35);
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    /* Jenkins Stages Grid */
    .jenkins-stages {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }

    .jenkins-stage-box {
      background: rgba(17, 24, 39, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 14px 10px;
      text-align: center;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .jenkins-stage-box.pending {
      border-color: rgba(255, 255, 255, 0.06);
      opacity: 0.55;
    }

    .jenkins-stage-box.running {
      border-color: #0ea5e9;
      background: rgba(14, 165, 233, 0.12);
      box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
      opacity: 1;
      animation: jenkins-stage-glow 1.8s infinite;
    }

    .jenkins-stage-box.success {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.09);
      opacity: 1;
    }

    .jenkins-stage-box.failed {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.12);
      opacity: 1;
    }

    @keyframes jenkins-stage-glow {
      0%, 100% { border-color: #0ea5e9; box-shadow: 0 0 12px rgba(14, 165, 233, 0.3); }
      50% { border-color: #38bdf8; box-shadow: 0 0 24px rgba(14, 165, 233, 0.6); }
    }

    .jenkins-stage-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin: 0 auto 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
    }
    .jenkins-stage-box.running .jenkins-stage-icon {
      background: #0ea5e9;
      color: #fff;
      animation: jenkins-spin 1.2s linear infinite;
    }
    .jenkins-stage-box.success .jenkins-stage-icon {
      background: #10b981;
      color: #fff;
    }
    .jenkins-stage-box.failed .jenkins-stage-icon {
      background: #ef4444;
      color: #fff;
    }

    @keyframes jenkins-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .jenkins-stage-title {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .jenkins-stage-duration {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    /* Jenkins Progress Bar (Striped & Animated) */
    .jenkins-bar-container {
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }

    .jenkins-bar-track {
      height: 16px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      margin-bottom: 8px;
    }

    .jenkins-bar-fill {
      height: 100%;
      width: 0%;
      background-color: #0ea5e9;
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.22) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.22) 50%,
        rgba(255, 255, 255, 0.22) 75%,
        transparent 75%,
        transparent
      );
      background-size: 28px 28px;
      animation: jenkins-stripes 1s linear infinite;
      transition: width 0.35s ease;
    }
    .jenkins-bar-fill.success {
      background-color: #10b981;
      animation: none;
    }
    .jenkins-bar-fill.failed {
      background-color: #ef4444;
      animation: none;
    }

    @keyframes jenkins-stripes {
      from { background-position: 0 0; }
      to { background-position: 28px 0; }
    }

    .jenkins-bar-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
    }
    .jenkins-bar-status-text {
      font-weight: 600;
      color: #38bdf8;
    }
    .jenkins-bar-pct {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #fff;
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

  <!-- Build Live Modal (Jenkins Style) -->
  <div id="buildModal" class="modal-overlay" onclick="if(event.target===this)closeBuildModal()">
    <div class="modal" style="max-width:760px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="jenkins-weather" id="modalJenkinsWeather">☀️</span>
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <h2 style="font-size:17px;font-weight:800;color:#fff" id="buildModalTitle">Build Pipeline</h2>
              <span class="jenkins-badge blue" id="modalJenkinsBadge">#IDLE</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              Node: <span style="color:#38bdf8">Laptop-Satria (Local Docker Engine)</span> • 0 EAS Cloud Quota
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="jenkins-timer" id="modalJenkinsTimer">⏱️ 00:00</div>
          <button onclick="closeBuildModal()" class="btn btn-secondary btn-sm">✕ Tutup</button>
        </div>
      </div>

      <!-- Jenkins 5 Stages -->
      <div class="jenkins-stages" id="modalJenkinsStages" style="margin-bottom:16px">
        <div class="jenkins-stage-box pending" id="mstage-init">
          <div class="jenkins-stage-icon">1</div>
          <div class="jenkins-stage-title">Checkout & Init</div>
          <div class="jenkins-stage-duration" id="mstage-time-init">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="mstage-config">
          <div class="jenkins-stage-icon">2</div>
          <div class="jenkins-stage-title">Env & Config</div>
          <div class="jenkins-stage-duration" id="mstage-time-config">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="mstage-compile">
          <div class="jenkins-stage-icon">3</div>
          <div class="jenkins-stage-title">Compile APK</div>
          <div class="jenkins-stage-duration" id="mstage-time-compile">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="mstage-transfer">
          <div class="jenkins-stage-icon">4</div>
          <div class="jenkins-stage-title">SCP to VPS</div>
          <div class="jenkins-stage-duration" id="mstage-time-transfer">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="mstage-deploy">
          <div class="jenkins-stage-icon">5</div>
          <div class="jenkins-stage-title">Verify & Publish</div>
          <div class="jenkins-stage-duration" id="mstage-time-deploy">-</div>
        </div>
      </div>

      <!-- Jenkins Striped Animated Progress Bar -->
      <div class="jenkins-bar-container" style="margin-bottom:14px">
        <div class="jenkins-bar-track">
          <div class="jenkins-bar-fill" id="modalJenkinsProgressFill"></div>
        </div>
        <div class="jenkins-bar-labels">
          <span class="jenkins-bar-status-text" id="modalJenkinsStatusText">Siap menjalankan build...</span>
          <span class="jenkins-bar-pct" id="modalJenkinsPctText">0%</span>
        </div>
      </div>

      <div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Console Output</span>
        <button onclick="document.getElementById('buildModalConsole').innerHTML=''" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px">Clear</button>
      </div>
      <div id="buildModalConsole" class="terminal-box" style="max-height:220px">Menunggu instruksi build...</div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">
        <a href="/apks" class="btn btn-primary btn-sm">Buka Halaman APK Full View →</a>
        <button onclick="closeBuildModal()" class="btn btn-secondary btn-sm">Tutup</button>
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
    let modalBuildTimer = null;
    let modalBuildStartTime = 0;

    function openZoomModal(src) {
      const modal = document.getElementById('zoomModal');
      const img = document.getElementById('zoomModalImg');
      img.src = src;
      modal.classList.add('active');
    }

    function setModalStageState(stageId, state, duration) {
      const el = document.getElementById(stageId);
      if (!el) return;
      el.className = 'jenkins-stage-box ' + state;
      const icon = el.querySelector('.jenkins-stage-icon');
      if (icon) {
        if (state === 'running') icon.textContent = '⚡';
        else if (state === 'success') icon.textContent = '✓';
        else if (state === 'failed') icon.textContent = '✕';
      }
      const durEl = el.querySelector('.jenkins-stage-duration');
      if (durEl && duration) durEl.textContent = duration;
    }

    function setModalProgress(pct, statusText, stateClass) {
      const fill = document.getElementById('modalJenkinsProgressFill');
      const text = document.getElementById('modalJenkinsStatusText');
      const pctEl = document.getElementById('modalJenkinsPctText');
      if (fill) {
        fill.style.width = pct + '%';
        fill.className = 'jenkins-bar-fill' + (stateClass ? ' ' + stateClass : '');
      }
      if (text && statusText) text.textContent = statusText;
      if (pctEl) pctEl.textContent = pct + '%';
    }

    function openBuildModal(profile) {
      const modal = document.getElementById('buildModal');
      const consoleBox = document.getElementById('buildModalConsole');
      const title = document.getElementById('buildModalTitle');
      const badge = document.getElementById('modalJenkinsBadge');
      const weather = document.getElementById('modalJenkinsWeather');
      const timerEl = document.getElementById('modalJenkinsTimer');

      title.textContent = 'Pipeline bukainjalan (' + profile.toUpperCase() + ')';
      badge.className = 'jenkins-badge blue';
      badge.textContent = '#BUILD-' + profile.toUpperCase();
      weather.textContent = '⛅';
      consoleBox.innerHTML = '<div class="log-dim">[' + new Date().toLocaleTimeString() + '] Menghubungkan ke Laptop Runner...</div>';
      modal.classList.add('active');

      ['mstage-init', 'mstage-config', 'mstage-compile', 'mstage-transfer', 'mstage-deploy'].forEach(id => {
        setModalStageState(id, 'pending', '-');
      });
      setModalStageState('mstage-init', 'running', '...');
      setModalProgress(10, 'Stage 1/5: Menginisialisasi runner environment...');

      modalBuildStartTime = Date.now();
      if (modalBuildTimer) clearInterval(modalBuildTimer);
      modalBuildTimer = setInterval(() => {
        const sec = Math.floor((Date.now() - modalBuildStartTime) / 1000);
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = '⏱️ ' + m + ':' + s;
      }, 1000);

      if (buildEventSource) buildEventSource.close();
      buildEventSource = new EventSource('/api/apks/build?profile=' + profile + '&target=laptop');

      buildEventSource.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const line = document.createElement('div');
          const msg = d.message || d.type || '';
          if (d.type === 'error' || msg.includes('BUILD_ERROR')) line.className = 'log-err';
          else if (d.type === 'done' || msg.includes('BUILD_DONE')) line.className = 'log-ok';
          else line.className = 'log-dim';
          line.textContent = '[' + (d.ts || new Date().toLocaleTimeString()) + '] ' + msg;
          consoleBox.appendChild(line);
          consoleBox.scrollTop = consoleBox.scrollHeight;

          if (msg.includes('Project directory') || msg.includes('profile')) {
            setModalStageState('mstage-init', 'success', '2s');
            setModalStageState('mstage-config', 'running', '...');
            setModalProgress(25, 'Stage 2/5: Konfigurasi project & dependensi...');
          }
          else if (msg.includes('eas build') || msg.includes('expo run') || msg.includes('gradle') || msg.includes('prebuild')) {
            setModalStageState('mstage-config', 'success', '4s');
            setModalStageState('mstage-compile', 'running', '...');
            setModalProgress(50, 'Stage 3/5: Mengompilasi APK secara lokal (Docker/Gradle)...');
          }
          else if (msg.includes('BUILD_TRANSFER') || msg.includes('SCP')) {
            setModalStageState('mstage-compile', 'success', 'ok');
            setModalStageState('mstage-transfer', 'running', '...');
            setModalProgress(80, 'Stage 4/5: Mentransfer APK ke VPS...');
          }
          else if (d.type === 'done' || msg.includes('BUILD_DONE') || msg.includes('selesai')) {
            setModalStageState('mstage-transfer', 'success', 'ok');
            setModalStageState('mstage-deploy', 'success', 'ok');
            setModalProgress(100, '✓ Pipeline Selesai! APK siap dipakai.', 'success');
            badge.className = 'jenkins-badge green';
            badge.textContent = '#SUCCESS';
            weather.textContent = '☀️';
            if (modalBuildTimer) { clearInterval(modalBuildTimer); modalBuildTimer = null; }
            if (buildEventSource) { buildEventSource.close(); buildEventSource = null; }
          }
          else if (d.type === 'error') {
            setModalProgress(100, '✕ Pipeline Gagal: ' + msg, 'failed');
            badge.className = 'jenkins-badge red';
            badge.textContent = '#FAILED';
            weather.textContent = '🌧️';
            if (modalBuildTimer) { clearInterval(modalBuildTimer); modalBuildTimer = null; }
            if (buildEventSource) { buildEventSource.close(); buildEventSource = null; }
          }
        } catch {}
      };

      buildEventSource.onerror = function() {
        setModalProgress(100, '✕ Koneksi runner terputus', 'failed');
        badge.className = 'jenkins-badge red';
        badge.textContent = '#FAILED';
        weather.textContent = '🌧️';
        if (modalBuildTimer) { clearInterval(modalBuildTimer); modalBuildTimer = null; }
        if (buildEventSource) { buildEventSource.close(); buildEventSource = null; }
      };
    }

    function closeBuildModal() {
      document.getElementById('buildModal').classList.remove('active');
      if (buildEventSource) {
        buildEventSource.close();
        buildEventSource = null;
      }
      if (modalBuildTimer) {
        clearInterval(modalBuildTimer);
        modalBuildTimer = null;
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
export function renderApksView({ builds = [] } = {}) {
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

    <!-- Jenkins Pipeline Card -->
    <div class="jenkins-pipeline-card">
      <div class="jenkins-header">
        <div class="jenkins-title-group">
          <span class="jenkins-weather" id="jenkinsWeather">☀️</span>
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <h2 style="font-size:17px;font-weight:800;color:#fff" id="jenkinsPipelineTitle">Pipeline bukainjalan_mobile (android)</h2>
              <span class="jenkins-badge blue" id="jenkinsPipelineBadge">#IDLE</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
              Node: <span style="color:#38bdf8" id="jenkinsPipelineNode">Laptop-Satria (Local Docker Engine)</span> • 0 EAS Cloud Quota
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:12px">
          <div class="jenkins-timer" id="jenkinsTimer">⏱️ 00:00</div>
          <button onclick="startApkBuild('staging')" class="btn btn-success btn-sm" id="btnBuildStaging">
            ▶ Build Staging
          </button>
          <button onclick="startApkBuild('production')" class="btn btn-primary btn-sm" id="btnBuildProd">
            ▶ Build Production
          </button>
        </div>
      </div>

      <!-- Jenkins Stage View -->
      <div class="jenkins-stages" id="jenkinsBuildStages">
        <div class="jenkins-stage-box pending" id="stage-init">
          <div class="jenkins-stage-icon">1</div>
          <div class="jenkins-stage-title">Checkout & Init</div>
          <div class="jenkins-stage-duration" id="stage-time-init">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="stage-config">
          <div class="jenkins-stage-icon">2</div>
          <div class="jenkins-stage-title">Env & Config</div>
          <div class="jenkins-stage-duration" id="stage-time-config">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="stage-compile">
          <div class="jenkins-stage-icon">3</div>
          <div class="jenkins-stage-title">Compile APK</div>
          <div class="jenkins-stage-duration" id="stage-time-compile">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="stage-transfer">
          <div class="jenkins-stage-icon">4</div>
          <div class="jenkins-stage-title">SCP to VPS</div>
          <div class="jenkins-stage-duration" id="stage-time-transfer">-</div>
        </div>
        <div class="jenkins-stage-box pending" id="stage-deploy">
          <div class="jenkins-stage-icon">5</div>
          <div class="jenkins-stage-title">Verify & Publish</div>
          <div class="jenkins-stage-duration" id="stage-time-deploy">-</div>
        </div>
      </div>

      <!-- Jenkins Striped Animated Progress Bar -->
      <div class="jenkins-bar-container">
        <div class="jenkins-bar-track">
          <div class="jenkins-bar-fill" id="jenkinsProgressFill"></div>
        </div>
        <div class="jenkins-bar-labels">
          <span class="jenkins-bar-status-text" id="jenkinsStatusText">Siap menjalankan build pipeline di laptop...</span>
          <span class="jenkins-bar-pct" id="jenkinsPctText">0%</span>
        </div>
      </div>

      <!-- Jenkins Console Output -->
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Console Output</span>
          <div style="display:flex;gap:8px">
            <label style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:4px;cursor:pointer">
              <input type="checkbox" id="jenkinsAutoScroll" checked> Auto-scroll
            </label>
            <button onclick="document.getElementById('buildConsole').innerHTML=''" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px">Clear</button>
          </div>
        </div>
        <div id="buildConsole" class="terminal-box" style="display:block;max-height:260px">
          <div class="log-dim">Klik tombol "Build Staging" atau "Build Production" di atas untuk memulai pipeline...</div>
        </div>
      </div>
    </div>

    <!-- Jenkins Build History & Reports Card -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-header">
        <div class="card-title">
          <span>📜</span> Build History & Pipeline Reports (Jenkins View)
        </div>
        <button onclick="loadBuildHistory()" class="btn btn-secondary btn-sm">🔄 Refresh History</button>
      </div>

      <div id="buildHistoryContainer">
        <p style="color:var(--text-muted);padding:24px 0;text-align:center">Memuat riwayat build...</p>
      </div>
    </div>

    <!-- APK List Table Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>📋</span> Daftar Versi APK (Build Artifacts)
        </div>
        <button onclick="loadApksList()" class="btn btn-secondary btn-sm">🔄 Refresh List</button>
      </div>
      
      <div id="apksTableContainer">
        <p style="color:var(--text-muted);padding:30px 0;text-align:center">Memuat daftar APK...</p>
      </div>
    </div>
  </div>

  <!-- Jenkins Build Report Modal -->
  <div id="buildReportModal" class="modal-overlay" onclick="if(event.target===this)closeReportModal()">
    <div class="modal" style="max-width:820px;max-height:92vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="jenkins-weather" id="repWeather">☀️</span>
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <h2 style="font-size:18px;font-weight:800;color:#fff" id="repTitle">Build Report #1</h2>
              <span class="jenkins-badge green" id="repBadge">#SUCCESS</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px" id="repSubtitle">
              Node: Laptop-Satria • Profile: staging • Durasi: 3m 48s
            </div>
          </div>
        </div>
        <button onclick="closeReportModal()" class="btn btn-secondary btn-sm">✕ Tutup</button>
      </div>

      <!-- Stage View Breakdown -->
      <h4 style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Stage View Breakdown</h4>
      <div class="jenkins-stages" id="repStages" style="margin-bottom:20px"></div>

      <!-- Failure Diagnosis (if failed) -->
      <div id="repFailureBox" style="display:none;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="font-weight:700;color:#f87171;font-size:14px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
          <span>❌</span> Root Cause / Error Diagnosis
        </div>
        <div id="repFailureText" style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#fca5a5;white-space:pre-wrap;word-break:break-all"></div>
      </div>

      <!-- Artifacts Section -->
      <div id="repArtifactBox" style="display:none;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="font-weight:700;color:#34d399;font-size:14px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
          <span>📦</span> Build Artifacts (Ready to Install)
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div>
            <div id="repArtifactName" style="font-weight:700;font-size:13px;color:#fff;font-family:'JetBrains Mono',monospace"></div>
            <div id="repArtifactSize" style="font-size:11px;color:var(--text-muted)"></div>
          </div>
          <div style="display:flex;gap:8px">
            <a id="repArtifactDownload" href="#" class="btn btn-success btn-sm" download>⬇️ Download APK</a>
          </div>
        </div>
      </div>

      <!-- Console Log -->
      <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <h4 style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Console Output Log</h4>
        <div style="display:flex;gap:6px">
          <button onclick="copyReportLog()" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px">📋 Copy</button>
          <a id="repDownloadLogBtn" href="#" target="_blank" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px" download>⬇️ Raw Log</a>
        </div>
      </div>
      <div id="repConsole" class="terminal-box" style="max-height:260px"></div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
        <button onclick="closeReportModal()" class="btn btn-secondary">Tutup</button>
      </div>
    </div>
  </div>
  `;

  const scripts = `
  <script>
    let sseSource = null;
    let buildTimerInterval = null;
    let buildStartTime = 0;

    function formatDuration(sec) {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return m + ':' + s;
    }

    function setStageState(stageId, state, durationText) {
      const box = document.getElementById(stageId);
      if (!box) return;
      box.className = 'jenkins-stage-box ' + state;
      const icon = box.querySelector('.jenkins-stage-icon');
      if (icon) {
        if (state === 'running') icon.textContent = '⚡';
        else if (state === 'success') icon.textContent = '✓';
        else if (state === 'failed') icon.textContent = '✕';
      }
      if (durationText) {
        const dEl = box.querySelector('.jenkins-stage-duration');
        if (dEl) dEl.textContent = durationText;
      }
    }

    function setPipelineProgress(pct, statusText, state = 'running') {
      const fill = document.getElementById('jenkinsProgressFill');
      const pText = document.getElementById('jenkinsPctText');
      const sText = document.getElementById('jenkinsStatusText');
      if (fill) {
        fill.style.width = pct + '%';
        fill.className = 'jenkins-bar-fill' + (state === 'success' ? ' success' : state === 'failed' ? ' failed' : '');
      }
      if (pText) pText.textContent = pct + '%';
      if (sText) sText.textContent = statusText;
    }

    function startApkBuild(profile, isResume = false) {
      const con = document.getElementById('buildConsole');
      const bStaging = document.getElementById('btnBuildStaging');
      const bProd = document.getElementById('btnBuildProd');
      const badge = document.getElementById('jenkinsPipelineBadge');
      const weather = document.getElementById('jenkinsWeather');
      const timerEl = document.getElementById('jenkinsTimer');

      bStaging.disabled = true;
      bProd.disabled = true;

      if (!isResume) {
        con.innerHTML = '<div class="log-dim">[' + new Date().toLocaleTimeString() + '] Menyiapkan trigger build (' + profile + ')...</div>';
        ['stage-init', 'stage-config', 'stage-compile', 'stage-transfer', 'stage-deploy'].forEach(id => {
          setStageState(id, 'pending', '-');
        });
        setStageState('stage-init', 'running', '...');
        setPipelineProgress(10, 'Stage 1/5: Menginisialisasi runner environment...');
        buildStartTime = Date.now();
      }

      badge.className = 'jenkins-badge blue';
      badge.textContent = '#BUILD-' + profile.toUpperCase();
      weather.textContent = '⛅';

      // Start stopwatch timer
      if (buildTimerInterval) clearInterval(buildTimerInterval);
      buildTimerInterval = setInterval(() => {
        const sec = Math.floor((Date.now() - buildStartTime) / 1000);
        timerEl.textContent = '⏱️ ' + formatDuration(sec);
      }, 1000);

      if (sseSource) sseSource.close();
      sseSource = new EventSource('/api/apks/build?profile=' + profile + '&target=laptop');

      sseSource.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const msg = d.message || d.type || '';
          const lower = msg.toLowerCase();

          // Sync initial state if reconnecting after navigation
          if (d.type === 'sync') {
            if (d.startTime) buildStartTime = d.startTime;
            if (d.logs && Array.isArray(d.logs)) {
              con.innerHTML = '';
              d.logs.forEach(l => {
                const line = document.createElement('div');
                line.className = l.includes('BUILD_ERROR') ? 'log-err' : (l.includes('BUILD_DONE') ? 'log-ok' : 'log-dim');
                line.textContent = l;
                con.appendChild(line);
              });
              con.scrollTop = con.scrollHeight;
            }
            if (d.stage) {
              const stages = ['init', 'config', 'compile', 'transfer', 'deploy'];
              const curIdx = stages.indexOf(d.stage);
              stages.forEach((st, idx) => {
                if (idx < curIdx) setStageState('stage-' + st, 'success', '✓');
                else if (idx === curIdx) setStageState('stage-' + st, 'running', '...');
                else setStageState('stage-' + st, 'pending', '-');
              });
            }
            if (d.progressPct) {
              setPipelineProgress(d.progressPct, d.statusText || 'Pipeline sedang berjalan...', d.status === 'success' ? 'success' : d.status === 'failed' ? 'failed' : 'running');
            }
            if (d.status === 'success') {
              badge.className = 'jenkins-badge green';
              badge.textContent = '#SUCCESS';
              weather.textContent = '☀️';
              finishBuild();
            } else if (d.status === 'failed') {
              badge.className = 'jenkins-badge red';
              badge.textContent = '#FAILED';
              weather.textContent = '🌧️';
              finishBuild();
            }
            return;
          }

          const line = document.createElement('div');
          if (d.type === 'error' || msg.includes('BUILD_ERROR')) line.className = 'log-err';
          else if (d.type === 'done' || msg.includes('BUILD_DONE')) line.className = 'log-ok';
          else line.className = 'log-dim';
          line.textContent = '[' + (d.ts || new Date().toLocaleTimeString()) + '] ' + msg;
          con.appendChild(line);

          if (document.getElementById('jenkinsAutoScroll')?.checked) {
            con.scrollTop = con.scrollHeight;
          }

          // Case-insensitive Stage detection
          if (lower.includes('project directory') || lower.includes('memulai local build')) {
            setStageState('stage-init', 'success', '2s');
            setStageState('stage-config', 'running', '...');
            setPipelineProgress(25, 'Stage 2/5: Konfigurasi project & dependensi...');
          }
          else if (
            lower.includes('eas build') ||
            lower.includes('expo run') ||
            lower.includes('gradle') ||
            lower.includes('assemblerelease') ||
            lower.includes('compile') ||
            lower.includes('task :') ||
            lower.includes('daemon')
          ) {
            setStageState('stage-init', 'success', '2s');
            setStageState('stage-config', 'success', '4s');
            setStageState('stage-compile', 'running', '...');
            let pct = 50;
            if (lower.includes('compilerelease') || lower.includes('packagerelease')) pct = 75;
            setPipelineProgress(pct, 'Stage 3/5: Mengompilasi APK secara lokal (Gradle & Kotlin)...');
          }
          else if (lower.includes('build_transfer') || lower.includes('scp') || lower.includes('transfer')) {
            setStageState('stage-init', 'success', '2s');
            setStageState('stage-config', 'success', '4s');
            setStageState('stage-compile', 'success', 'ok');
            setStageState('stage-transfer', 'running', '...');
            setPipelineProgress(85, 'Stage 4/5: Mentransfer APK ke VPS (deploy@76.13.21.10)...');
          }
          else if (d.type === 'done' || msg.includes('BUILD_DONE') || lower.includes('selesai')) {
            setStageState('stage-transfer', 'success', 'ok');
            setStageState('stage-deploy', 'success', 'ok');
            setPipelineProgress(100, '✓ Pipeline Selesai! APK siap dipakai.', 'success');
            badge.className = 'jenkins-badge green';
            badge.textContent = '#SUCCESS';
            weather.textContent = '☀️';
            finishBuild();
          }
          else if (d.type === 'error') {
            setPipelineProgress(100, '✕ Pipeline Gagal: ' + msg, 'failed');
            badge.className = 'jenkins-badge red';
            badge.textContent = '#FAILED';
            weather.textContent = '🌧️';
            finishBuild();
          }
        } catch {}
      };

      sseSource.onerror = async function() {
        // EventSource will automatically retry connecting. Check server status to stay updated.
        try {
          const res = await fetch('/api/apks/build/status');
          const st = await res.json();
          if (st.active) {
            setPipelineProgress(st.progressPct || 50, '⚠️ Menghubungkan ulang telemetry runner (Kompilasi sedang berjalan)...');
            return;
          } else if (st.status === 'success') {
            setPipelineProgress(100, '✓ Pipeline Selesai! APK siap dipakai.', 'success');
            badge.className = 'jenkins-badge green';
            badge.textContent = '#SUCCESS';
            weather.textContent = '☀️';
            finishBuild();
            return;
          } else if (st.status === 'failed') {
            setPipelineProgress(100, st.statusText || '✕ Pipeline Gagal', 'failed');
            badge.className = 'jenkins-badge red';
            badge.textContent = '#FAILED';
            weather.textContent = '🌧️';
            finishBuild();
            return;
          }
        } catch {}
      };
    }

    function finishBuild() {
      if (buildTimerInterval) {
        clearInterval(buildTimerInterval);
        buildTimerInterval = null;
      }
      if (sseSource) {
        sseSource.close();
        sseSource = null;
      }
      document.getElementById('btnBuildStaging').disabled = false;
      document.getElementById('btnBuildProd').disabled = false;
      loadApksList();
      loadBuildHistory();
    }

    async function checkActiveBuild() {
      try {
        const res = await fetch('/api/apks/build/status');
        const st = await res.json();
        if (st.active) {
          buildStartTime = st.startTime || Date.now();
          startApkBuild(st.profile || 'staging', true);
        }
      } catch {}
    }

    async function loadBuildHistory() {
      const container = document.getElementById('buildHistoryContainer');
      if (!container) return;
      try {
        const res = await fetch('/api/apks/history');
        const d = await res.json();
        const builds = d.builds || [];
        if (builds.length === 0) {
          container.innerHTML = '<p style="color:var(--text-muted);padding:30px 0;text-align:center">Belum ada riwayat build. Jalankan build pipeline untuk membuat history pertama.</p>';
          return;
        }

        const rows = builds.map(b => {
          const isSuccess = b.status === 'SUCCESS';
          const isRunning = b.status === 'RUNNING';
          const badgeClass = isSuccess ? 'green' : (isRunning ? 'blue' : 'red');
          const weather = b.weather || (isSuccess ? '☀️' : (isRunning ? '⛅' : '🌧️'));
          const dateStr = b.startTime ? new Date(b.startTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
          const durationStr = b.durationSec ? formatDuration(b.durationSec) : (b.startTime && isRunning ? formatDuration(Math.floor((Date.now() - b.startTime)/1000)) : '-');
          const artifactHtml = b.apkFile 
            ? '<a href="/apks/' + encodeURIComponent(b.apkFile) + '" class="btn btn-secondary btn-sm" download style="padding:3px 8px;font-size:11px" title="' + b.apkFile + '">⬇️ APK</a>'
            : '<span style="color:var(--text-muted);font-size:11px">-</span>';

          return '<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">' +
            '<td style="padding:12px 14px;font-family:monospace;font-weight:700">' +
              '<a href="javascript:void(0)" class="btn-open-report" data-report-id="' + (b.id || b.jobId) + '" style="color:#38bdf8;text-decoration:none">#' + (b.id || (b.jobId ? b.jobId.slice(-4) : '1')) + '</a>' +
            '</td>' +
            '<td style="padding:12px 14px;font-size:18px">' + weather + '</td>' +
            '<td style="padding:12px 14px"><span class="jenkins-badge ' + badgeClass + '" style="font-size:10px">#' + b.status + '</span></td>' +
            '<td style="padding:12px 14px;font-size:12px;font-weight:600">' + (b.profile || 'staging') + '</td>' +
            '<td style="padding:12px 14px;font-size:12px;color:var(--text-muted)">' + (b.node || 'Laptop-Satria') + '</td>' +
            '<td style="padding:12px 14px;font-family:monospace;font-size:12px">' + durationStr + '</td>' +
            '<td style="padding:12px 14px;font-size:12px;color:var(--text-muted)">' + dateStr + '</td>' +
            '<td style="padding:12px 14px">' + artifactHtml + '</td>' +
            '<td style="padding:12px 14px;text-align:right">' +
              '<button class="btn btn-secondary btn-sm btn-open-report" data-report-id="' + (b.id || b.jobId) + '" style="padding:3px 8px;font-size:11px">📑 Report</button>' +
            '</td>' +
          '</tr>';
        }).join('');

        container.innerHTML = '<div style="overflow-x:auto">' +
          '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left">' +
            '<thead>' +
              '<tr style="border-bottom:1px solid var(--border);color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:0.5px">' +
                '<th style="padding:10px 14px">Build</th>' +
                '<th style="padding:10px 14px">W</th>' +
                '<th style="padding:10px 14px">Status</th>' +
                '<th style="padding:10px 14px">Profile</th>' +
                '<th style="padding:10px 14px">Node</th>' +
                '<th style="padding:10px 14px">Durasi</th>' +
                '<th style="padding:10px 14px">Waktu</th>' +
                '<th style="padding:10px 14px">Artifact</th>' +
                '<th style="padding:10px 14px;text-align:right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>';

        container.querySelectorAll('.btn-open-report').forEach(el => {
          el.addEventListener('click', () => openBuildReport(el.dataset.reportId));
        });
      } catch (e) {
        container.innerHTML = '<p style="color:#f87171;padding:20px 0;text-align:center">Gagal memuat riwayat: ' + e.message + '</p>';
      }
    }

    let activeReportLogText = '';

    async function openBuildReport(id) {
      try {
        const res = await fetch('/api/apks/history/' + encodeURIComponent(id));
        const b = await res.json();
        if (!b || b.error) return alert('Report tidak ditemukan');

        document.getElementById('repTitle').textContent = 'Build Report #' + (b.id || b.jobId);
        document.getElementById('repWeather').textContent = b.weather || (b.status === 'SUCCESS' ? '☀️' : (b.status === 'RUNNING' ? '⛅' : '🌧️'));
        
        const badge = document.getElementById('repBadge');
        badge.className = 'jenkins-badge ' + (b.status === 'SUCCESS' ? 'green' : (b.status === 'RUNNING' ? 'blue' : 'red'));
        badge.textContent = '#' + b.status;

        const dur = b.durationSec ? formatDuration(b.durationSec) : '-';
        document.getElementById('repSubtitle').textContent = 'Node: ' + (b.node || 'Laptop-Satria') + ' • Profile: ' + (b.profile || 'staging') + ' • Durasi: ' + dur;

        // Render Stages
        const stContainer = document.getElementById('repStages');
        const stageList = [
          { id: 'init', name: 'Checkout & Init', dur: b.stageTimes?.init || '2s' },
          { id: 'config', name: 'Env & Config', dur: b.stageTimes?.config || '4s' },
          { id: 'compile', name: 'Compile APK', dur: b.stageTimes?.compile || (b.status === 'FAILED' ? 'failed' : '3m 48s') },
          { id: 'transfer', name: 'SCP to VPS', dur: b.stageTimes?.transfer || (b.status === 'SUCCESS' ? '12s' : '-') },
          { id: 'deploy', name: 'Verify & Publish', dur: b.stageTimes?.deploy || (b.status === 'SUCCESS' ? '3s' : '-') }
        ];

        stContainer.innerHTML = stageList.map(st => {
          let state = 'pending';
          let icon = '•';
          if (b.status === 'SUCCESS') {
            state = 'success';
            icon = '✓';
          } else if (b.status === 'FAILED') {
            if (st.id === 'init' || st.id === 'config') { state = 'success'; icon = '✓'; }
            else if (st.id === 'compile') { state = 'failed'; icon = '✕'; }
            else { state = 'pending'; icon = '-'; }
          } else if (b.status === 'RUNNING') {
            state = 'running';
            icon = '⚡';
          }
          return '<div class="jenkins-stage-box ' + state + '">' +
            '<div class="jenkins-stage-icon">' + icon + '</div>' +
            '<div class="jenkins-stage-title">' + st.name + '</div>' +
            '<div class="jenkins-stage-duration">' + st.dur + '</div>' +
          '</div>';
        }).join('');

        // Failure diagnosis
        const failBox = document.getElementById('repFailureBox');
        const failText = document.getElementById('repFailureText');
        if (b.status === 'FAILED' && b.errorReason) {
          failBox.style.display = 'block';
          failText.textContent = b.errorReason;
        } else {
          failBox.style.display = 'none';
        }

        // Artifact box
        const artBox = document.getElementById('repArtifactBox');
        if (b.apkFile) {
          artBox.style.display = 'block';
          document.getElementById('repArtifactName').textContent = b.apkFile;
          const sz = b.apkSize ? (b.apkSize > 1024*1024 ? (b.apkSize/1024/1024).toFixed(1)+' MB' : (b.apkSize/1024).toFixed(0)+' KB') : '';
          document.getElementById('repArtifactSize').textContent = sz ? 'Ukuran: ' + sz : '';
          document.getElementById('repArtifactDownload').href = '/apks/' + encodeURIComponent(b.apkFile);
        } else {
          artBox.style.display = 'none';
        }

        // Logs
        const consoleEl = document.getElementById('repConsole');
        const dlBtn = document.getElementById('repDownloadLogBtn');
        dlBtn.href = '/api/apks/history/' + encodeURIComponent(b.id || b.jobId) + '/log';

        if (b.logs && Array.isArray(b.logs) && b.logs.length > 0) {
          activeReportLogText = b.logs.join('\\n');
          consoleEl.innerHTML = b.logs.map(l => {
            const cls = l.includes('BUILD_ERROR') ? 'log-err' : (l.includes('BUILD_DONE') ? 'log-ok' : 'log-dim');
            return '<div class="' + cls + '">' + escapeHtml(l) + '</div>';
          }).join('');
        } else {
          activeReportLogText = 'Tidak ada riwayat log yang tersimpan.';
          consoleEl.innerHTML = '<div class="log-dim">Tidak ada riwayat log yang tersimpan.</div>';
        }

        document.getElementById('buildReportModal').classList.add('active');
      } catch (e) {
        alert('Gagal memuat report: ' + e.message);
      }
    }

    function closeReportModal() {
      document.getElementById('buildReportModal').classList.remove('active');
    }

    function copyReportLog() {
      if (!activeReportLogText) return;
      navigator.clipboard.writeText(activeReportLogText);
      alert('Console log berhasil disalin ke clipboard!');
    }

    async function loadApksList() {
      const container = document.getElementById('apksTableContainer');
      if (!container) return;
      try {
        const res = await fetch('/api/apks');
        const d = await res.json();
        const apks = d.apks || [];
        if (apks.length === 0) {
          container.innerHTML = '<div style="color:var(--text-muted);padding:36px 0;text-align:center">' +
            '<div style="font-size:32px;margin-bottom:8px">📦</div>' +
            '<div style="font-weight:600;font-size:14px;color:#fff;margin-bottom:4px">Belum Ada APK Tersedia di VPS</div>' +
            '<div style="font-size:12px">Klik tombol <b>▶ Build Staging</b> di atas untuk mengompilasi APK secara lokal di laptop.</div>' +
          '</div>';
          return;
        }

        const rows = apks.map(apk => {
          const sz = apk.size ? (apk.size > 1024*1024 ? (apk.size/1024/1024).toFixed(1)+' MB' : (apk.size/1024).toFixed(0)+' KB') : '-';
          const time = apk.time ? new Date(apk.time).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
          return '<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">' +
            '<td style="padding:12px 14px;font-family:monospace;font-weight:700;color:#fff">' + apk.name + '</td>' +
            '<td style="padding:12px 14px"><span class="jenkins-badge blue">v' + (apk.version || 'preview') + '</span></td>' +
            '<td style="padding:12px 14px;font-family:monospace;font-size:12px">' + sz + '</td>' +
            '<td style="padding:12px 14px;font-size:12px;color:var(--text-muted)">' + time + '</td>' +
            '<td style="padding:12px 14px;text-align:right">' +
              '<div style="display:flex;gap:6px;justify-content:flex-end">' +
                '<a href="/apks/' + encodeURIComponent(apk.file) + '" class="btn btn-secondary btn-sm" download style="padding:3px 8px;font-size:11px">⬇️ Unduh</a>' +
                '<button class="btn btn-primary btn-sm btn-install-apk" data-apk-file="' + encodeURIComponent(apk.file) + '" style="padding:3px 8px;font-size:11px">📲 Install</button>' +
              '</div>' +
            '</td>' +
          '</tr>';
        }).join('');

        container.innerHTML = '<div style="overflow-x:auto">' +
          '<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left">' +
            '<thead>' +
              '<tr style="border-bottom:1px solid var(--border);color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:0.5px">' +
                '<th style="padding:10px 14px">Nama File</th>' +
                '<th style="padding:10px 14px">Versi</th>' +
                '<th style="padding:10px 14px">Ukuran</th>' +
                '<th style="padding:10px 14px">Waktu Build</th>' +
                '<th style="padding:10px 14px;text-align:right">Aksi</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>';

        container.querySelectorAll('.btn-install-apk').forEach(el => {
          el.addEventListener('click', () => installApkToEmulator(el.dataset.apkFile));
        });
      } catch (e) {
        container.innerHTML = '<p style="color:#f87171;padding:20px 0;text-align:center">Gagal memuat APK: ' + e.message + '</p>';
      }
    }

    async function installApkToEmulator(file) {
      if (!confirm('Install APK ' + decodeURIComponent(file) + ' ke emulator?')) return;
      try {
        const res = await fetch('/api/apks/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: decodeURIComponent(file) })
        });
        const d = await res.json();
        alert(d.message || (d.ok ? 'Sukses terinstall!' : 'Gagal: ' + d.error));
      } catch (e) {
        alert('Gagal install: ' + e.message);
      }
    }

    function escapeHtml(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    loadApksList();
    loadBuildHistory();
    checkActiveBuild();
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
// TEST BANK VIEW (GET /screenshots) - JENKINS / ALLURE TESTOPS STANDARD
// ─────────────────────────────────────────────────────────────
export function renderTestBankView({ scenarios = [], runs = [], metrics = null, runner = null }) {
  const totalRuns = metrics?.total ?? runs.length;
  const passedRuns = metrics?.passed ?? runs.filter(r => r.status === 'pass').length;
  const failedRuns = metrics?.failed ?? runs.filter(r => r.status === 'fail').length;
  const passRate = metrics?.passRate ?? (totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 100);
  const avgDuration = metrics?.avgDuration ?? (totalRuns > 0 ? (runs.reduce((acc, r) => acc + (parseFloat(r.duration) || 0), 0) / totalRuns).toFixed(1) : '12.0');
  const isRunnerOnline = !!runner?.online;
  const runnerDevice = runner?.device || 'emulator-5554';

  // Scenario Cards HTML
  const cardsHtml = scenarios.map(s => {
    const isPass = s.status === 'pass';
    const isFail = s.status === 'fail';
    const statusColor = isPass ? '#10b981' : isFail ? '#ef4444' : '#f59e0b';
    const statusIcon = isPass ? '☀️' : isFail ? '🌧️' : '⏳';
    const statusText = isPass ? 'PASSED' : isFail ? 'FAILED' : 'PENDING';
    const lastTime = s.lastCapture ? s.lastCapture.slice(0, 19).replace('T', ' ') : '-';
    const durText = s.lastDuration ? `⏱️ ${s.lastDuration}` : '⏱️ ~12s';

    return `
      <div class="card scenario-card" data-scenario="${s.name}" style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;background:rgba(17,24,39,0.75);border:1px solid ${statusColor}35;border-radius:12px;transition:all 0.25s;box-shadow:0 4px 20px rgba(0,0,0,0.25)">
        <div style="display:flex;align-items:center;gap:18px;flex:1">
          <div style="width:50px;height:50px;border-radius:12px;background:${statusColor}15;border:1px solid ${statusColor}40;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">
            ${statusIcon}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <a href="/screenshots/${encodeURIComponent(s.name)}" style="font-weight:800;font-size:16px;color:#fff;text-decoration:none">
                ${s.name} ${s.hasAutomation ? '<span style="font-size:11px;background:rgba(14,165,233,0.15);color:#38bdf8;padding:2px 7px;border-radius:6px;border:1px solid rgba(14,165,233,0.3);margin-left:6px">AUTOMATED SOM</span>' : ''}
              </a>
              <span id="badge-status-${s.name}" class="jenkins-badge ${isPass ? 'green' : isFail ? 'red' : 'yellow'}" style="font-size:11px;padding:3px 9px;border-radius:6px;font-weight:700">
                ${statusText}
              </span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <span>📸 <b>${s.captures}</b> screenshots tersimpan</span>
              <span>•</span>
              <span id="badge-dur-${s.name}">${durText}</span>
              <span>•</span>
              <span id="badge-time-${s.name}">Terakhir: ${lastTime}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center">
          <button onclick="runScenarioQuick('${s.name}', event)" class="btn btn-success btn-sm" style="display:flex;align-items:center;gap:6px;font-weight:700;padding:8px 16px;border-radius:8px;box-shadow:0 2px 10px rgba(16,185,129,0.3)">
            ▶ Run Kepingan
          </button>
          <button onclick="openScenarioReportModal('${s.name}', '${s.lastRunId || ''}')" class="btn btn-secondary btn-sm" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px" title="Lihat Report & Validasi Layar">
            🔍 Lihat Report
          </button>
          <a href="/screenshots/${encodeURIComponent(s.name)}" class="btn btn-secondary btn-sm" style="text-decoration:none;padding:8px 12px;border-radius:8px">Detail ›</a>
        </div>
      </div>
    `;
  }).join('');

  // History Table Rows
  const historyRowsHtml = runs.map((r, idx) => {
    const isPass = r.status === 'pass';
    const isFail = r.status === 'fail';
    const statusPill = isPass ? '<span class="jenkins-badge green">✓ SUCCESS</span>' : isFail ? '<span class="jenkins-badge red">✗ FAILURE</span>' : '<span class="jenkins-badge yellow">⏳ RUNNING</span>';
    const stepsPill = `${r.stepsPassed ?? r.steps?.length ?? 0}/${r.stepsTotal ?? r.steps?.length ?? 5} Steps`;
    const timeStr = r.timeStr || (r.timestamp ? r.timestamp.slice(0, 19).replace('T', ' ') : '-');
    const durStr = r.duration ? `${r.duration}s` : '-';

    return `
      <tr class="history-row" data-status="${r.status}" data-scenario="${r.scenario || ''}" style="border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.2s">
        <td style="padding:14px 16px;font-weight:700">
          <a href="javascript:void(0)" onclick="openRunReportModal('${r.runId}')" style="color:#38bdf8;text-decoration:none">
            #${r.runId || ('RUN-' + (runs.length - idx))}
          </a>
        </td>
        <td style="padding:14px 16px;font-size:18px">${r.weather || (isPass ? '☀️' : isFail ? '🌧️' : '⏳')}</td>
        <td style="padding:14px 16px">
          <div style="font-weight:700;color:#fff">${r.scenarioTitle || r.scenario || 'Full E2E Suite'}</div>
          <div style="font-size:11px;color:var(--text-muted)">Target: com.bukainjalan.app</div>
        </td>
        <td style="padding:14px 16px">${statusPill}</td>
        <td style="padding:14px 16px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#cbd5e1">⏱️ ${durStr}</td>
        <td style="padding:14px 16px">
          <span style="font-size:12px;background:rgba(255,255,255,0.06);padding:3px 8px;border-radius:6px;border:1px solid var(--border)">${stepsPill}</span>
        </td>
        <td style="padding:14px 16px;font-size:12px;color:var(--text-muted)">${timeStr}</td>
        <td style="padding:14px 16px">
          <span style="font-size:11px;color:#94a3b8;background:rgba(0,0,0,0.3);padding:3px 8px;border-radius:6px">📱 ${r.device || 'emulator-5554'}</span>
        </td>
        <td style="padding:14px 16px">
          <div style="display:flex;gap:6px">
            <button onclick="openRunReportModal('${r.runId}')" class="btn btn-secondary btn-sm" style="padding:5px 10px;font-size:11px">
              🔍 Report
            </button>
            <button onclick="runScenarioQuick('${r.scenario || 'all'}', event)" class="btn btn-secondary btn-sm" style="padding:5px 9px;font-size:11px" title="Re-run">
              ↻
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const body = `
  <div class="container" style="max-width:1200px">
    
    <!-- Top Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.5px">🧪 Test Bank & Automation Pipeline</h1>
          <span class="jenkins-badge green" style="font-size:11px;padding:3px 8px">ENTERPRISE QA</span>
        </div>
        <p style="color:var(--text-muted);font-size:14px">Modular E2E QA Automation, Quality Gates, & Build Telemetry • BukainJalan Mobile App.</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button onclick="runAllScenariosQuick()" class="btn btn-success" style="font-weight:800;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);box-shadow:0 4px 14px rgba(16,185,129,0.35);padding:10px 18px;border-radius:9px">
          ▶ Run Semua Kepingan (Full E2E)
        </button>
        <button onclick="syncLiveData(true)" class="btn btn-secondary" style="border-radius:9px;padding:10px 14px" title="Sinkronisasi Data Real-Time">
          ↻ Sync Data
        </button>
        <button onclick="document.getElementById('newScenarioModal').classList.add('active')" class="btn btn-secondary" style="border-radius:9px;padding:10px 16px">
          + Scenario Baru
        </button>
      </div>
    </div>

    <!-- Executive Quality Gate KPI Bar (Jenkins / Allure Standard) -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(230px, 1fr));gap:16px;margin-bottom:28px">
      
      <!-- KPI 1: Total Runs -->
      <div class="card" style="padding:18px 20px;border-left:4px solid #0ea5e9;background:rgba(17,24,39,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.5px">Total Eksekusi Uji</span>
          <span style="font-size:20px">📊</span>
        </div>
        <div id="kpi-total-runs" style="font-size:28px;font-weight:800;color:#fff">${totalRuns} <span style="font-size:14px;font-weight:500;color:var(--text-muted)">Builds</span></div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Riwayat eksekusi kepingan & full suite</div>
      </div>

      <!-- KPI 2: Quality Gate Pass Rate -->
      <div class="card" style="padding:18px 20px;border-left:4px solid #10b981;background:rgba(17,24,39,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.5px">Quality Gate Pass Rate</span>
          <span style="font-size:20px">🛡️</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:8px">
          <div id="kpi-pass-rate" style="font-size:28px;font-weight:800;color:#10b981">${passRate}%</div>
          <span style="font-size:12px;color:#10b981;font-weight:700">(${passedRuns} Pass / ${failedRuns} Fail)</span>
        </div>
        <div style="width:100%;height:6px;background:rgba(255,255,255,0.08);border-radius:99px;margin-top:8px;overflow:hidden">
          <div id="kpi-progress-bar" style="width:${passRate}%;height:100%;background:linear-gradient(90deg, #10b981, #059669)"></div>
        </div>
      </div>

      <!-- KPI 3: Avg Duration -->
      <div class="card" style="padding:18px 20px;border-left:4px solid #8b5cf6;background:rgba(17,24,39,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.5px">Rata-Rata Durasi</span>
          <span style="font-size:20px">⚡</span>
        </div>
        <div id="kpi-avg-duration" style="font-size:28px;font-weight:800;color:#fff">${avgDuration}s</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Waktu eksekusi rata-rata per kepingan</div>
      </div>

      <!-- KPI 4: Active Runner & Device -->
      <div class="card" style="padding:18px 20px;border-left:4px solid ${isRunnerOnline ? '#10b981' : '#f59e0b'};background:rgba(17,24,39,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.5px">Node Perangkat Aktif</span>
          <span style="font-size:20px">📱</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="pulse-dot online"></span>
          <span style="font-size:18px;font-weight:700;color:#fff">${runnerDevice}</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Android 14 • 1080x2280 • ADB Local Bridge</div>
      </div>

    </div>

    <!-- Main Navigation Tabs -->
    <div style="display:flex;gap:12px;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:20px">
      <button id="navTabScenarios" onclick="switchMainTab('scenarios')" class="btn btn-primary" style="font-weight:700;border-radius:9px;display:flex;align-items:center;gap:8px">
        🧪 Skenario Test Bank (${scenarios.length})
      </button>
      <button id="navTabHistory" onclick="switchMainTab('history')" class="btn btn-secondary" style="font-weight:700;border-radius:9px;display:flex;align-items:center;gap:8px">
        📋 Riwayat Test Runs (Build History) <span id="tabHistoryCount" style="font-size:11px;background:rgba(255,255,255,0.12);padding:2px 7px;border-radius:10px">${runs.length}</span>
      </button>
    </div>

    <!-- TAB 1: MODULAR SCENARIOS VIEW -->
    <div id="contentTabScenarios" style="display:flex;flex-direction:column;gap:14px">
      ${scenarios.length > 0 ? cardsHtml : `
        <div class="card" style="text-align:center;padding:60px 20px">
          <div style="font-size:48px;margin-bottom:12px">🧪</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:6px">Belum Ada Skenario Testing</h3>
          <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px">Buat skenario pertama untuk mulai menguji dan mendokumentasikan fitur aplikasi.</p>
          <button onclick="document.getElementById('newScenarioModal').classList.add('active')" class="btn btn-primary">+ Buat Skenario Baru</button>
        </div>
      `}
    </div>

    <!-- TAB 2: BUILD HISTORY TABLE (JENKINS STANDARD) -->
    <div id="contentTabHistory" style="display:none;flex-direction:column;gap:16px">
      
      <!-- Table Filter Bar -->
      <div class="card" style="padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:13px;font-weight:700;color:var(--text-muted)">Filter Status:</span>
          <button onclick="filterHistoryTable('all')" class="btn btn-secondary btn-sm btn-filter active" id="btnFilterAll">Semua (${runs.length})</button>
          <button onclick="filterHistoryTable('pass')" class="btn btn-secondary btn-sm btn-filter" id="btnFilterPass">✅ Passed (${passedRuns})</button>
          <button onclick="filterHistoryTable('fail')" class="btn btn-secondary btn-sm btn-filter" id="btnFilterFail">❌ Failed (${failedRuns})</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="text" id="historySearchInput" placeholder="Cari skenario atau build ID..." onkeyup="searchHistoryTable(this.value)" style="background:#0b1120;border:1px solid var(--border);color:#fff;padding:7px 14px;border-radius:8px;font-size:12px;outline:none;width:240px">
        </div>
      </div>

      <!-- History Table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13px">
            <thead>
              <tr style="background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border);color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:0.5px">
                <th style="padding:14px 16px">#Build</th>
                <th style="padding:14px 16px">W</th>
                <th style="padding:14px 16px">Skenario Target</th>
                <th style="padding:14px 16px">Status</th>
                <th style="padding:14px 16px">Durasi</th>
                <th style="padding:14px 16px">Validasi Steps</th>
                <th style="padding:14px 16px">Waktu Eksekusi</th>
                <th style="padding:14px 16px">Perangkat Node</th>
                <th style="padding:14px 16px">Aksi</th>
              </tr>
            </thead>
            <tbody id="historyTableBody">
              ${historyRowsHtml || '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">Belum ada riwayat build test run.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>

  <!-- INTERACTIVE REPORT CAPTURE MODAL (QUALITY GATE REPORT) -->
  <div id="reportCaptureModal" class="modal-overlay" onclick="if(event.target===this)this.classList.remove('active')">
    <div class="modal" style="max-width:960px;width:95%;background:#0b1120;border:1px solid var(--border);box-shadow:0 25px 60px -10px rgba(0,0,0,0.85);max-height:90vh;display:flex;flex-direction:column;padding:24px">
      
      <!-- Report Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <h2 id="reportModalTitle" style="font-size:20px;font-weight:800;color:#fff">Quality Gate & Test Report</h2>
            <span id="reportModalVerdict" class="jenkins-badge green" style="font-size:12px;padding:4px 10px">✓ PASSED</span>
          </div>
          <div id="reportModalSubtitle" style="font-size:12px;color:var(--text-muted)">Build details and step screenshots validation</div>
        </div>
        <button onclick="document.getElementById('reportCaptureModal').classList.remove('active')" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer">✕</button>
      </div>

      <!-- Report Metadata Strip -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:18px;background:rgba(255,255,255,0.02);padding:12px 16px;border-radius:10px;border:1px solid var(--border)">
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Total Durasi</div>
          <div id="reportMetaDur" style="font-weight:700;color:#fff;font-size:14px">⏱️ 0s</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Validasi Steps</div>
          <div id="reportMetaSteps" style="font-weight:700;color:#10b981;font-size:14px">5/5 Passed</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Perangkat Eksekutor</div>
          <div id="reportMetaDevice" style="font-weight:700;color:#fff;font-size:14px">emulator-5554</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Waktu Eksekusi</div>
          <div id="reportMetaTime" style="font-weight:700;color:#fff;font-size:14px">-</div>
        </div>
      </div>

      <!-- Report Tabs -->
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <button id="tabBtnReportSteps" onclick="switchReportTab('steps')" class="btn btn-primary btn-sm" style="font-weight:700;border-radius:8px">
          📸 Tangkapan Layar Tiap Step
        </button>
        <button id="tabBtnReportLogs" onclick="switchReportTab('logs')" class="btn btn-secondary btn-sm" style="border-radius:8px">
          📜 Telemetri & Console Log
        </button>
      </div>

      <!-- Report Tab 1: Step Captures Gallery -->
      <div id="reportContentSteps" style="overflow-y:auto;flex:1;padding-right:6px">
        <div id="reportStepsGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:16px">
          <!-- Step cards inserted dynamically -->
        </div>
      </div>

      <!-- Report Tab 2: Console Log -->
      <div id="reportContentLogs" style="display:none;overflow-y:auto;flex:1">
        <pre id="reportLogsPre" style="background:#030712;border:1px solid var(--border);border-radius:8px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#cbd5e1;line-height:1.6;white-space:pre-wrap;height:100%"></pre>
      </div>

      <!-- Report Footer -->
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
        <button class="btn btn-secondary" onclick="document.getElementById('reportCaptureModal').classList.remove('active')">Tutup</button>
      </div>

    </div>
  </div>

  <!-- Zoom Modal -->
  <div id="zoomModal" class="modal-overlay" onclick="this.classList.remove('active')">
    <img id="zoomModalImg" src="" style="max-width:92vw;max-height:92vh;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,0.8);object-fit:contain">
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

  <!-- Live Test Bank Execution Modal -->
  <div id="testRunModal" class="modal-overlay">
    <div class="modal" style="max-width:760px;width:95%;background:#0b1120;border:1px solid var(--border);box-shadow:0 25px 50px -12px rgba(0,0,0,0.7)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">⚡</span>
          <div>
            <h2 id="modalRunTitle" style="font-size:18px;font-weight:800;margin:0;color:#fff">Menjalankan Pengujian...</h2>
            <div id="modalRunSubtitle" style="font-size:12px;color:var(--text-muted)">Live Emulator ADB Pipeline Runner</div>
          </div>
        </div>
        <span id="modalRunBadge" class="jenkins-badge yellow" style="font-size:12px;padding:4px 10px">#RUNNING</span>
      </div>

      <div class="jenkins-progress-bar" style="margin-bottom:16px;background:rgba(255,255,255,0.06);height:8px;border-radius:99px;overflow:hidden">
        <div id="modalProgressBar" class="jenkins-bar-fill running" style="width:10%;height:100%;transition:width 0.3s;background:linear-gradient(90deg, #3b82f6, #10b981)"></div>
      </div>

      <div id="modalLogBox" style="background:#030712;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;height:280px;overflow-y:auto;color:#cbd5e1;line-height:1.6">
        <div style="color:#64748b">Menghubungkan ke Android Emulator via Runner...</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
        <div id="modalElapsedText" style="font-size:12px;color:var(--text-muted)">Elapsed: 0s</div>
        <div style="display:flex;gap:10px">
          <button id="modalCloseBtn" class="btn btn-secondary" onclick="closeTestRunModal()">Tutup</button>
          <button id="modalViewReportBtn" class="btn btn-primary" style="display:none;font-weight:700" onclick="viewLatestReportFromModal()">🔍 Lihat Report Capture</button>
          <button id="modalRefreshBtn" class="btn btn-success" style="display:none;font-weight:700" onclick="syncLiveData(true);closeTestRunModal()">✓ Selesai & Refresh Data</button>
        </div>
      </div>
    </div>
  </div>
  `;

  const scripts = `
  <script>
    let activeTestSSE = null;
    let testTimer = null;
    let testSeconds = 0;
    let lastFinishedScenario = null;
    let lastFinishedRunId = null;

    function switchMainTab(tab) {
      const btnScenarios = document.getElementById('navTabScenarios');
      const btnHistory = document.getElementById('navTabHistory');
      const contentScenarios = document.getElementById('contentTabScenarios');
      const contentHistory = document.getElementById('contentTabHistory');

      if (tab === 'scenarios') {
        btnScenarios.className = 'btn btn-primary';
        btnHistory.className = 'btn btn-secondary';
        contentScenarios.style.display = 'flex';
        contentHistory.style.display = 'none';
      } else {
        btnScenarios.className = 'btn btn-secondary';
        btnHistory.className = 'btn btn-primary';
        contentScenarios.style.display = 'none';
        contentHistory.style.display = 'flex';
      }
    }

    function switchReportTab(tab) {
      const btnSteps = document.getElementById('tabBtnReportSteps');
      const btnLogs = document.getElementById('tabBtnReportLogs');
      const contentSteps = document.getElementById('reportContentSteps');
      const contentLogs = document.getElementById('reportContentLogs');

      if (tab === 'steps') {
        btnSteps.className = 'btn btn-primary btn-sm';
        btnLogs.className = 'btn btn-secondary btn-sm';
        contentSteps.style.display = 'block';
        contentLogs.style.display = 'none';
      } else {
        btnSteps.className = 'btn btn-secondary btn-sm';
        btnLogs.className = 'btn btn-primary btn-sm';
        contentSteps.style.display = 'none';
        contentLogs.style.display = 'block';
      }
    }

    function filterHistoryTable(status) {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      if (status === 'all') document.getElementById('btnFilterAll').classList.add('active');
      if (status === 'pass') document.getElementById('btnFilterPass').classList.add('active');
      if (status === 'fail') document.getElementById('btnFilterFail').classList.add('active');

      document.querySelectorAll('.history-row').forEach(row => {
        if (status === 'all' || row.getAttribute('data-status') === status) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    function searchHistoryTable(query) {
      const q = query.toLowerCase().trim();
      document.querySelectorAll('.history-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    }

    function openZoomModal(src) {
      const m = document.getElementById('zoomModal');
      document.getElementById('zoomModalImg').src = src;
      m.classList.add('active');
    }

    function openTestRunModal(title) {
      document.getElementById('modalRunTitle').textContent = title;
      document.getElementById('modalRunSubtitle').textContent = 'Live SSE Execution Stream';
      document.getElementById('modalRunBadge').className = 'jenkins-badge yellow';
      document.getElementById('modalRunBadge').textContent = '#RUNNING';
      document.getElementById('modalProgressBar').style.width = '15%';
      document.getElementById('modalLogBox').innerHTML = '<div style="color:#64748b">Menghubungkan ke Test Engine...</div>';
      document.getElementById('modalRefreshBtn').style.display = 'none';
      document.getElementById('modalViewReportBtn').style.display = 'none';
      document.getElementById('modalCloseBtn').textContent = 'Batal';
      document.getElementById('testRunModal').classList.add('active');

      testSeconds = 0;
      clearInterval(testTimer);
      testTimer = setInterval(() => {
        testSeconds++;
        document.getElementById('modalElapsedText').textContent = 'Elapsed: ' + testSeconds + 's';
      }, 1000);
    }

    function closeTestRunModal() {
      if (activeTestSSE) {
        activeTestSSE.close();
        activeTestSSE = null;
      }
      clearInterval(testTimer);
      document.getElementById('testRunModal').classList.remove('active');
    }

    function runScenarioQuick(name, evt) {
      if (evt) evt.stopPropagation();
      lastFinishedScenario = name;
      openTestRunModal('Skenario: ' + name);

      const logBox = document.getElementById('modalLogBox');
      const pBar = document.getElementById('modalProgressBar');
      const badge = document.getElementById('modalRunBadge');
      let isDone = false;

      if (activeTestSSE) activeTestSSE.close();
      activeTestSSE = new EventSource('/screenshots/' + encodeURIComponent(name) + '/run?target=laptop');

      activeTestSSE.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const line = document.createElement('div');

          if (d.type === 'step' || d.type === 'runner_step') {
            line.style.color = d.status === 'pass' ? '#34d399' : '#f87171';
            const stepName = d.name || d.description || ('Step ' + (d.stepIndex || d.current || ''));
            line.textContent = (d.status === 'pass' ? '✓ ' : '✗ ') + stepName + (d.screenshot ? ' [' + d.screenshot + ']' : '');
            if (d.percent) pBar.style.width = d.percent + '%';
          } else if (d.type === 'progress' || d.type === 'runner_progress') {
            const pct = d.percent || d.progressPct;
            if (pct) pBar.style.width = pct + '%';
          } else if (d.type === 'result' || d.type === 'runner_test_result') {
            isDone = true;
            clearInterval(testTimer);
            pBar.style.width = '100%';
            badge.className = 'jenkins-badge ' + (d.status === 'pass' ? 'green' : 'red');
            badge.textContent = d.status === 'pass' ? '#SUCCESS' : '#FAILED';
            line.style.fontWeight = 'bold';
            line.style.color = d.status === 'pass' ? '#10b981' : '#ef4444';
            line.textContent = '🏁 ' + (d.message || 'Selesai');
            document.getElementById('modalCloseBtn').textContent = 'Tutup';
            document.getElementById('modalRefreshBtn').style.display = 'inline-block';
            document.getElementById('modalViewReportBtn').style.display = 'inline-block';
            if (activeTestSSE) { activeTestSSE.close(); activeTestSSE = null; }
            syncLiveData(false);
          } else {
            line.style.color = '#94a3b8';
            line.textContent = (d.message ? (d.message.startsWith('ℹ') ? '' : 'ℹ️ ') + d.message : JSON.stringify(d));
          }

          logBox.appendChild(line);
          logBox.scrollTop = logBox.scrollHeight;
        } catch (err) {
          console.error(err);
        }
      };

      activeTestSSE.onerror = function() {
        if (isDone) return;
        clearInterval(testTimer);
        badge.className = 'jenkins-badge red';
        badge.textContent = '#ERROR';
        const line = document.createElement('div');
        line.style.color = '#ef4444';
        line.textContent = '❌ Koneksi stream terputus.';
        logBox.appendChild(line);
        document.getElementById('modalRefreshBtn').style.display = 'inline-block';
        if (activeTestSSE) { activeTestSSE.close(); activeTestSSE = null; }
      };
    }

    function runAllScenariosQuick() {
      openTestRunModal('Full E2E Suite (5 Kepingan Test Bank)');

      const logBox = document.getElementById('modalLogBox');
      const pBar = document.getElementById('modalProgressBar');
      const badge = document.getElementById('modalRunBadge');
      let isDone = false;

      if (activeTestSSE) activeTestSSE.close();
      activeTestSSE = new EventSource('/api/testbank/run-all?target=laptop');

      activeTestSSE.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const line = document.createElement('div');

          if (d.type === 'step' || d.type === 'runner_step') {
            line.style.color = d.status === 'pass' ? '#34d399' : '#f87171';
            const stepName = d.name || d.description || ('Step ' + (d.stepIndex || d.current || ''));
            line.textContent = (d.status === 'pass' ? '✓ ' : '✗ ') + stepName + (d.screenshot ? ' [' + d.screenshot + ']' : '');
            if (d.percent) pBar.style.width = d.percent + '%';
          } else if (d.type === 'progress' || d.type === 'runner_progress') {
            const pct = d.percent || d.progressPct;
            if (pct) pBar.style.width = pct + '%';
          } else if (d.type === 'result' || d.type === 'runner_test_result') {
            isDone = true;
            clearInterval(testTimer);
            pBar.style.width = '100%';
            badge.className = 'jenkins-badge ' + (d.status === 'pass' ? 'green' : 'red');
            badge.textContent = d.status === 'pass' ? '#SUCCESS' : '#FAILED';
            line.style.fontWeight = 'bold';
            line.style.color = d.status === 'pass' ? '#10b981' : '#ef4444';
            line.textContent = '🏁 ' + (d.message || 'Selesai');
            document.getElementById('modalCloseBtn').textContent = 'Tutup';
            document.getElementById('modalRefreshBtn').style.display = 'inline-block';
            document.getElementById('modalViewReportBtn').style.display = 'inline-block';
            if (activeTestSSE) { activeTestSSE.close(); activeTestSSE = null; }
            syncLiveData(false);
          } else {
            line.style.color = '#94a3b8';
            line.textContent = (d.message ? (d.message.startsWith('ℹ') ? '' : 'ℹ️ ') + d.message : JSON.stringify(d));
          }

          logBox.appendChild(line);
          logBox.scrollTop = logBox.scrollHeight;
        } catch (err) {
          console.error(err);
        }
      };

      activeTestSSE.onerror = function() {
        if (isDone) return;
        clearInterval(testTimer);
        badge.className = 'jenkins-badge red';
        badge.textContent = '#ERROR';
        const line = document.createElement('div');
        line.style.color = '#ef4444';
        line.textContent = '❌ Koneksi stream terputus.';
        logBox.appendChild(line);
        document.getElementById('modalRefreshBtn').style.display = 'inline-block';
        if (activeTestSSE) { activeTestSSE.close(); activeTestSSE = null; }
      };
    }

    async function syncLiveData(showAlert = false) {
      try {
        const res = await fetch('/api/test-runs');
        const data = await res.json();
        if (!data || !data.ok) return;

        // Update KPI metrics
        if (data.metrics) {
          document.getElementById('kpi-total-runs').innerHTML = data.metrics.total + ' <span style="font-size:14px;font-weight:500;color:var(--text-muted)">Builds</span>';
          document.getElementById('kpi-pass-rate').textContent = data.metrics.passRate + '%';
          document.getElementById('kpi-progress-bar').style.width = data.metrics.passRate + '%';
          document.getElementById('kpi-avg-duration').textContent = data.metrics.avgDuration + 's';
        }

        // Update Scenario Cards status
        const runs = data.runs || [];
        runs.forEach(r => {
          if (!r.scenario) return;
          const badge = document.getElementById('badge-status-' + r.scenario);
          if (badge) {
            badge.className = 'jenkins-badge ' + (r.status === 'pass' ? 'green' : r.status === 'fail' ? 'red' : 'yellow');
            badge.textContent = (r.status || 'pending').toUpperCase();
          }
          const durBadge = document.getElementById('badge-dur-' + r.scenario);
          if (durBadge && r.duration) {
            durBadge.textContent = '⏱️ ' + r.duration + 's';
          }
          const timeBadge = document.getElementById('badge-time-' + r.scenario);
          if (timeBadge && (r.timeStr || r.timestamp)) {
            timeBadge.textContent = 'Terakhir: ' + (r.timeStr || r.timestamp.slice(0, 19).replace('T', ' '));
          }
        });

        if (showAlert) alert('Data telemetri & build history berhasil disinkronkan!');
      } catch (err) {
        console.warn('Gagal sync live data:', err);
      }
    }

    async function openRunReportModal(runId) {
      try {
        const res = await fetch('/api/test-runs/' + encodeURIComponent(runId));
        const data = await res.json();
        if (!data || !data.ok || !data.run) {
          return alert('Data run #' + runId + ' tidak ditemukan!');
        }
        renderReportDetails(data.run);
      } catch (err) {
        alert('Gagal mengambil detail report: ' + err.message);
      }
    }

    async function openScenarioReportModal(scenarioName, lastRunId) {
      if (lastRunId) {
        return openRunReportModal(lastRunId);
      }
      try {
        const res = await fetch('/api/test-runs');
        const data = await res.json();
        const runs = data.runs || [];
        const match = runs.find(r => r.scenario === scenarioName);
        if (match) {
          renderReportDetails(match);
        } else {
          location.href = '/screenshots/' + encodeURIComponent(scenarioName);
        }
      } catch (e) {
        location.href = '/screenshots/' + encodeURIComponent(scenarioName);
      }
    }

    function viewLatestReportFromModal() {
      closeTestRunModal();
      if (lastFinishedScenario) {
        openScenarioReportModal(lastFinishedScenario, null);
      }
    }

    function renderReportDetails(run) {
      const modal = document.getElementById('reportCaptureModal');
      const isPass = run.status === 'pass';
      const isFail = run.status === 'fail';

      document.getElementById('reportModalTitle').textContent = 'Quality Gate & Test Report: ' + (run.scenarioTitle || run.scenario || run.runId);
      const verdict = document.getElementById('reportModalVerdict');
      verdict.className = 'jenkins-badge ' + (isPass ? 'green' : isFail ? 'red' : 'yellow');
      verdict.textContent = isPass ? '✓ QUALITY GATE: PASSED' : isFail ? '✗ QUALITY GATE: FAILED' : '⏳ RUNNING';

      document.getElementById('reportModalSubtitle').textContent = 'Build ID: #' + (run.runId || '-') + ' • Target: com.bukainjalan.app • Evaluated via ADB local bridge';
      document.getElementById('reportMetaDur').textContent = '⏱️ ' + (run.duration ? run.duration + 's' : '-');
      document.getElementById('reportMetaSteps').textContent = (run.stepsPassed || run.steps?.length || 0) + '/' + (run.stepsTotal || run.steps?.length || 5) + ' Passed';
      document.getElementById('reportMetaDevice').textContent = '📱 ' + (run.device || 'emulator-5554');
      document.getElementById('reportMetaTime').textContent = run.timeStr || run.timestamp || '-';

      // Render Steps Grid
      const grid = document.getElementById('reportStepsGrid');
      grid.innerHTML = '';
      const steps = run.steps || [];

      if (steps.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-muted);padding:30px;text-align:center;grid-column:1/-1">Belum ada tangkapan layar step tersimpan untuk build ini.</div>';
      } else {
        steps.forEach(st => {
          const card = document.createElement('div');
          card.style.background = 'rgba(255,255,255,0.03)';
          card.style.border = '1px solid var(--border)';
          card.style.borderRadius = '10px';
          card.style.overflow = 'hidden';

          const imgUrl = st.screenshotUrl || ('/screenshots/' + encodeURIComponent(run.scenario) + '/' + encodeURIComponent(st.filename || 'latest.png'));
          const sColor = st.status === 'pass' ? '#10b981' : '#ef4444';

          card.innerHTML = \`
            <div style="padding:10px 14px;background:rgba(0,0,0,0.3);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12px;font-weight:700;color:#fff">Step \${st.stepIndex}/\${st.total || steps.length}: \${st.name || ''}</span>
              <span style="font-size:10px;font-weight:700;color:\${sColor};background:\${sColor}18;padding:2px 7px;border-radius:6px;border:1px solid \${sColor}30">\${(st.status || 'pass').toUpperCase()}</span>
            </div>
            <div style="cursor:zoom-in;background:#030712;display:flex;align-items:center;justify-content:center" onclick="openZoomModal('\${imgUrl}')">
              <img src="\${imgUrl}" loading="lazy" style="width:100%;aspect-ratio:411/731;object-fit:cover;display:block">
            </div>
            <div style="padding:8px 12px;font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between">
              <span>\${st.filename || '-'}</span>
              <span>\${st.duration ? '⏱️ ' + st.duration + 's' : ''}</span>
            </div>
          \`;
          grid.appendChild(card);
        });
      }

      // Render Logs
      const logsPre = document.getElementById('reportLogsPre');
      logsPre.textContent = (run.logs && run.logs.length > 0) ? run.logs.join('\\n') : (run.summaryMessage || 'Tidak ada log telemetri.');

      switchReportTab('steps');
      modal.classList.add('active');
    }

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
    title: 'Test Bank & Pipeline Quality Gate',
    activePage: 'testbank',
    body,
    scripts
  });
}

// ─────────────────────────────────────────────────────────────
// SCENARIO DETAIL VIEW (GET /screenshots/:scenario)
// ─────────────────────────────────────────────────────────────
export function renderScenarioDetailView({ scenario, caps = [], md = '', yaml = '', status = 'pending', runner = null, runs = [], testScript = '' }) {
  const statusColor = status === 'pass' ? '#10b981' : status === 'fail' ? '#ef4444' : '#f59e0b';
  const statusIcon = status === 'pass' ? '✅ PASS' : status === 'fail' ? '❌ FAIL' : '⏳ PENDING';

  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Run history list
  const runsList = Array.isArray(runs) ? runs : [];
  const hasRuns = runsList.length > 0;

  // Build HTML for each run's step cards
  const runsPanelsHtml = runsList.map((r, rIdx) => {
    const isFirst = rIdx === 0;
    const rStatusColor = r.status === 'pass' ? '#10b981' : r.status === 'fail' ? '#ef4444' : '#f59e0b';
    const rStatusText = r.status === 'pass' ? '✓ PASS' : r.status === 'fail' ? '✗ FAIL' : '⏳ RUNNING';
    const steps = r.steps || [];

    const stepsCards = steps.length > 0 ? steps.map(s => {
      const sColor = s.status === 'pass' ? '#10b981' : '#ef4444';
      const durText = s.duration ? `⏱️ ${s.duration}s` : 'OK';
      return `
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:all 0.2s">
          <div style="padding:10px 14px;background:rgba(0,0,0,0.3);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;font-weight:700;color:#fff">Step ${s.stepIndex}/${s.total || steps.length}: ${s.name}</span>
            <span style="font-size:11px;font-weight:700;color:${sColor};background:${sColor}18;padding:2px 8px;border-radius:6px;border:1px solid ${sColor}30">${s.status.toUpperCase()} • ${durText}</span>
          </div>
          <div style="cursor:zoom-in;background:#030712;display:flex;align-items:center;justify-content:center" onclick="openZoomModal('/screenshots/${encodeURIComponent(scenario)}/${encodeURIComponent(s.filename)}')">
            <img src="/screenshots/${encodeURIComponent(scenario)}/${encodeURIComponent(s.filename)}" loading="lazy" style="width:100%;aspect-ratio:411/731;object-fit:cover;display:block">
          </div>
          <div style="padding:8px 12px;font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between">
            <span>${s.filename}</span>
            <span>${s.time ? s.time.slice(11, 19) : ''}</span>
          </div>
        </div>
      `;
    }).join('') : `
      <div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px">
        Belum ada step screenshot tersimpan pada sesi ini.
      </div>
    `;

    return `
      <div class="run-history-panel" id="run-panel-${r.runId || rIdx}" style="display:${isFirst ? 'flex' : 'none'};flex-direction:column;gap:14px">
        <div style="padding:10px 14px;background:${rStatusColor}12;border:1px solid ${rStatusColor}30;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:13px;color:#fff">${r.runId || 'Run #' + (runsList.length - rIdx)} • <span style="color:${rStatusColor}">${rStatusText}</span></div>
            <div style="font-size:11px;color:var(--text-muted)">Waktu: ${r.timeStr || r.timestamp || '-'} • Total Steps: ${steps.length}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="runScenarioQuick('${scenario}', event)">↻ Re-run Skenario</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:14px">
          ${stepsCards}
        </div>
      </div>
    `;
  }).join('');

  // Fallback raw capture cards
  const captureCardsHtml = caps.filter(f => f.name !== 'latest.png').map(f => {
    const t = f.name.replace('.png','').replace(/[-]/g,':').replace(':','-',1);
    const sizeStr = f.size > 1024*1024 ? (f.size/1024/1024).toFixed(1)+' MB' : (f.size/1024).toFixed(0)+' KB';
    return `
      <div id="cap-card-${encodeURIComponent(f.name)}" style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;overflow:hidden;position:relative;transition:all 0.3s">
        <div style="cursor:zoom-in;background:#030712;display:flex;align-items:center;justify-content:center" onclick="openZoomModal('/screenshots/${encodeURIComponent(scenario)}/${encodeURIComponent(f.name)}')">
          <img src="/screenshots/${encodeURIComponent(scenario)}/${encodeURIComponent(f.name)}" loading="lazy" style="width:100%;aspect-ratio:411/731;object-fit:cover;display:block">
        </div>
        <div style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-muted)">
          <span>${t}</span>
          <span>${sizeStr}</span>
        </div>
        <button onclick="deleteSingleCapture('${encodeURIComponent(scenario)}', '${encodeURIComponent(f.name)}')" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.65);border:none;color:#fff;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;transition:background 0.2s" title="Hapus screenshot">✕</button>
      </div>
    `;
  }).join('');

  const body = `
  <div class="container" style="max-width:1200px">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <a href="/screenshots" class="btn btn-secondary btn-sm">‹ Kembali ke Test Bank</a>
        <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#fff">${scenario}</h1>
        <span style="font-size:12px;font-weight:700;color:${statusColor};background:${statusColor}18;padding:4px 10px;border-radius:8px;border:1px solid ${statusColor}35">
          ${statusIcon}
        </span>
        <span style="font-size:13px;color:var(--text-muted)">${hasRuns ? runsList.length + ' runs tercatat' : caps.length + ' captures'}</span>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-success btn-sm" onclick="runScenarioQuick('${scenario}', event)" style="font-weight:700;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(16,185,129,0.3)">
          ▶ Run Kepingan Ini
        </button>
        <button class="btn btn-primary btn-sm" onclick="runScenarioQuick('${scenario}', event)">
          📱 Run di Mobile Emulator
        </button>
        <a href="/capture?scenario=${encodeURIComponent(scenario)}&target=laptop" class="btn btn-secondary btn-sm" title="Capture dari Emulator Laptop">
          📷 Snap Emulator
        </a>
        <a href="/screenshots/${encodeURIComponent(scenario)}/delete" class="btn btn-danger btn-sm" onclick="return confirm('Hapus seluruh skenario ${scenario}?')">
          🗑 Hapus
        </a>
      </div>
    </div>

    <!-- Layout: 2 Columns (Script on Left, Runs & Captures on Right) -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
      
      <!-- Script & Documentation Card -->
      <div class="card" style="padding:18px">
        <!-- Tabs Header -->
        <div style="display:flex;gap:8px;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:14px">
          <button id="tabBtnCode" class="btn btn-primary btn-sm" onclick="switchScriptTab('code')" style="font-weight:700;border-radius:8px">
            🧪 QA Automation Script (JavaScript SOM)
          </button>
          <button id="tabBtnDoc" class="btn btn-secondary btn-sm" onclick="switchScriptTab('doc')" style="border-radius:8px">
            📋 Catatan Skenario (Markdown)
          </button>
        </div>

        <!-- Tab 1: QA Automation Code -->
        <div id="tabContentCode">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:12px;color:var(--text-muted)">Berkas: <code style="color:#38bdf8">qa-automation/scenarios/${scenario}.test.js</code></span>
            <span class="jenkins-badge green" style="font-size:11px">Plug & Play SOM</span>
          </div>
          <pre style="background:#030712;border:1px solid var(--border);border-radius:10px;padding:14px;max-height:560px;overflow:auto;font-family:'JetBrains Mono',monospace;font-size:12px;color:#cbd5e1;line-height:1.6;white-space:pre-wrap"><code>${escapeHtml(testScript || '// File skenario otomatisasi: qa-automation/scenarios/' + scenario + '.test.js\n// Menggunakan Screen Object Model')}</code></pre>
        </div>

        <!-- Tab 2: Markdown Scenario Doc -->
        <div id="tabContentDoc" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:12px;color:var(--text-muted)">Deskripsi & spesifikasi expected result</span>
            <div style="display:flex;align-items:center;gap:10px">
              <span id="saveStatus" style="font-size:12px;color:#10b981;opacity:0;transition:opacity 0.25s">✓ Tersimpan</span>
              <button onclick="saveScriptDirect()" class="btn btn-primary btn-sm">💾 Simpan</button>
            </div>
          </div>
          <textarea id="editorArea" style="width:100%;min-height:500px;background:#030712;color:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.6;resize:vertical;outline:none">${md || ''}</textarea>
        </div>
      </div>

      <!-- Validated Captures & Run History Card -->
      <div class="card" style="padding:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <div class="card-title" style="margin:0;font-size:15px;font-weight:700">
            <span>📸</span> Validasi Layar & Riwayat Run
          </div>
          <a href="/capture?scenario=${encodeURIComponent(scenario)}&target=laptop" class="btn btn-secondary btn-sm">+ Ambil Foto Layar</a>
        </div>

        ${hasRuns ? `
          <!-- Run Session Selector -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;background:rgba(255,255,255,0.02);padding:10px 14px;border-radius:8px;border:1px solid var(--border)">
            <label for="runHistorySelect" style="font-size:12px;font-weight:700;color:var(--text-muted);white-space:nowrap">Pilih Sesi Pengujian:</label>
            <select id="runHistorySelect" onchange="switchRunView(this.value)" style="flex:1;background:#0b1120;border:1px solid var(--border);color:#fff;padding:6px 12px;border-radius:7px;font-size:12px;outline:none">
              ${runsList.map((r, idx) => {
                const rStatus = r.status === 'pass' ? '✅ PASS' : r.status === 'fail' ? '❌ FAIL' : '⏳ RUNNING';
                const rTime = r.timeStr || (r.timestamp ? r.timestamp.slice(0, 16).replace('T', ' ') : `Run #${idx + 1}`);
                return `<option value="${r.runId || idx}">Run #${runsList.length - idx} • ${rTime} [${rStatus}] (${r.steps?.length || 0} Steps)</option>`;
              }).join('')}
            </select>
          </div>

          <!-- Run Panels Container -->
          <div id="runsPanelsContainer">
            ${runsPanelsHtml}
          </div>
        ` : (caps.length > 0 ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:12px">
            ${captureCardsHtml}
          </div>
        ` : `
          <div style="text-align:center;padding:50px 20px;color:var(--text-muted)">
            <div style="font-size:36px;margin-bottom:8px">🧪</div>
            <p style="font-size:13px;margin-bottom:14px">Belum ada hasil eksekusi pengujian untuk skenario ini.</p>
            <button class="btn btn-success btn-sm" onclick="runScenarioQuick('${scenario}', event)">▶ Jalankan Pengujian Sekarang</button>
          </div>
        `)}
      </div>

    </div>
  </div>

  <!-- Zoom Modal -->
  <div id="zoomModal" class="modal-overlay" onclick="this.classList.remove('active')">
    <img id="zoomModalImg" src="" style="max-width:92vw;max-height:92vh;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,0.8);object-fit:contain">
  </div>

  <!-- Live Test Bank Execution Modal -->
  <div id="testRunModal" class="modal-overlay">
    <div class="modal" style="max-width:760px;width:95%;background:#0b1120;border:1px solid var(--border);box-shadow:0 25px 50px -12px rgba(0,0,0,0.7)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">⚡</span>
          <div>
            <h2 id="modalRunTitle" style="font-size:18px;font-weight:800;margin:0;color:#fff">Menjalankan Pengujian...</h2>
            <div id="modalRunSubtitle" style="font-size:12px;color:var(--text-muted)">Live Emulator ADB Pipeline Runner</div>
          </div>
        </div>
        <span id="modalRunBadge" class="jenkins-badge yellow" style="font-size:12px;padding:4px 10px">#RUNNING</span>
      </div>

      <div class="jenkins-progress-bar" style="margin-bottom:16px;background:rgba(255,255,255,0.06);height:8px;border-radius:99px;overflow:hidden">
        <div id="modalProgressBar" class="jenkins-bar-fill running" style="width:10%;height:100%;transition:width 0.3s;background:linear-gradient(90deg, #3b82f6, #10b981)"></div>
      </div>

      <div id="modalLogBox" style="background:#030712;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;height:280px;overflow-y:auto;color:#cbd5e1;line-height:1.6">
        <div style="color:#64748b">Menghubungkan ke Android Emulator via Runner...</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
        <div id="modalElapsedText" style="font-size:12px;color:var(--text-muted)">Elapsed: 0s</div>
        <div style="display:flex;gap:10px">
          <button id="modalCloseBtn" class="btn btn-secondary" onclick="closeTestRunModal()">Tutup</button>
          <button id="modalRefreshBtn" class="btn btn-success" style="display:none;font-weight:700" onclick="location.reload()">✓ Selesai & Refresh Data</button>
        </div>
      </div>
    </div>
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

    function switchScriptTab(tab) {
      const btnCode = document.getElementById('tabBtnCode');
      const btnDoc = document.getElementById('tabBtnDoc');
      const contentCode = document.getElementById('tabContentCode');
      const contentDoc = document.getElementById('tabContentDoc');

      if (tab === 'code') {
        btnCode.className = 'btn btn-primary btn-sm';
        btnDoc.className = 'btn btn-secondary btn-sm';
        contentCode.style.display = 'block';
        contentDoc.style.display = 'none';
      } else {
        btnCode.className = 'btn btn-secondary btn-sm';
        btnDoc.className = 'btn btn-primary btn-sm';
        contentCode.style.display = 'none';
        contentDoc.style.display = 'block';
      }
    }

    function switchRunView(runId) {
      document.querySelectorAll('.run-history-panel').forEach(el => {
        el.style.display = 'none';
      });
      const target = document.getElementById('run-panel-' + runId);
      if (target) target.style.display = 'flex';
    }

    // Auto-save markdown script
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

    async function deleteSingleCapture(scenario, file) {
      if (!confirm('Hapus screenshot ini?')) return;
      try {
        await fetch('/screenshots/' + scenario + '/delete-file?file=' + file, {
          headers: { 'Accept': 'application/json' }
        });
        const card = document.getElementById('cap-card-' + file);
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.85)';
          setTimeout(() => card.remove(), 250);
        } else {
          location.reload();
        }
      } catch (e) {
        location.reload();
      }
    }

    let activeTestSSE = null;
    let testTimer = null;
    let testSeconds = 0;

    function openTestRunModal(title) {
      document.getElementById('modalRunTitle').textContent = title;
      document.getElementById('modalRunSubtitle').textContent = 'Live SSE Execution Stream';
      document.getElementById('modalRunBadge').className = 'jenkins-badge yellow';
      document.getElementById('modalRunBadge').textContent = '#RUNNING';
      document.getElementById('modalProgressBar').style.width = '15%';
      document.getElementById('modalLogBox').innerHTML = '<div style="color:#64748b">Menghubungkan ke Android Emulator via Runner...</div>';
      document.getElementById('modalRefreshBtn').style.display = 'none';
      document.getElementById('modalCloseBtn').textContent = 'Batal';
      document.getElementById('testRunModal').classList.add('active');

      testSeconds = 0;
      clearInterval(testTimer);
      testTimer = setInterval(() => {
        testSeconds++;
        document.getElementById('modalElapsedText').textContent = 'Elapsed: ' + testSeconds + 's';
      }, 1000);
    }

    function closeTestRunModal() {
      if (activeTestSSE) {
        activeTestSSE.close();
        activeTestSSE = null;
      }
      clearInterval(testTimer);
      document.getElementById('testRunModal').classList.remove('active');
    }

    function runScenarioQuick(name, evt) {
      if (evt) evt.stopPropagation();
      openTestRunModal('Skenario: ' + name);

      const logBox = document.getElementById('modalLogBox');
      const pBar = document.getElementById('modalProgressBar');
      const badge = document.getElementById('modalRunBadge');
      let isDone = false;

      if (activeTestSSE) activeTestSSE.close();
      activeTestSSE = new EventSource('/screenshots/' + encodeURIComponent(name) + '/run?target=laptop');

      activeTestSSE.onmessage = function(e) {
        try {
          const d = JSON.parse(e.data);
          const line = document.createElement('div');

          if (d.type === 'step' || d.type === 'runner_step') {
            line.style.color = d.status === 'pass' ? '#34d399' : '#f87171';
            const stepName = d.name || d.description || ('Step ' + (d.stepIndex || ''));
            line.textContent = (d.status === 'pass' ? '✓ ' : '✗ ') + stepName + (d.screenshot ? ' [' + d.screenshot + ']' : '');
            if (d.percent) pBar.style.width = d.percent + '%';
          } else if (d.type === 'progress' || d.type === 'runner_progress') {
            const pct = d.percent || d.progressPct;
            if (pct) pBar.style.width = pct + '%';
          } else if (d.type === 'result' || d.type === 'runner_test_result') {
            isDone = true;
            clearInterval(testTimer);
            pBar.style.width = '100%';
            badge.className = 'jenkins-badge ' + (d.status === 'pass' ? 'green' : 'red');
            badge.textContent = d.status === 'pass' ? '#SUCCESS' : '#FAILED';
            line.style.fontWeight = 'bold';
            line.style.color = d.status === 'pass' ? '#10b981' : '#ef4444';
            line.textContent = '🏁 ' + (d.message || 'Selesai');
            document.getElementById('modalCloseBtn').textContent = 'Tutup';
            document.getElementById('modalRefreshBtn').style.display = 'inline-block';
            if (activeTestSSE) { activeTestSSE.close(); activeTestSSE = null; }
          } else {
            line.style.color = '#94a3b8';
            line.textContent = (d.message ? (d.message.startsWith('ℹ') ? '' : 'ℹ️ ') + d.message : JSON.stringify(d));
          }

          logBox.appendChild(line);
          logBox.scrollTop = logBox.scrollHeight;
        } catch (err) {
          console.error(err);
        }
      };

      activeTestSSE.onerror = function() {
        if (isDone) return;
        clearInterval(testTimer);
        badge.className = 'jenkins-badge red';
        badge.textContent = '#ERROR';
        const line = document.createElement('div');
        line.style.color = '#ef4444';
        line.textContent = '❌ Koneksi stream terputus.';
        logBox.appendChild(line);
        document.getElementById('modalRefreshBtn').style.display = 'inline-block';
        if (activeTestSSE) { activeTestSSE.close(); activeTestSSE = null; }
      };
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

