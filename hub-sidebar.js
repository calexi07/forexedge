/* ForexEdge — Hub Sidebar (self-contained) */
const _HUB_SB_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _HUB_SB_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

/* ── Inject sidebar CSS ── */
(function injectCSS() {
  if (document.getElementById('hub-sidebar-css')) return;
  const style = document.createElement('style');
  style.id = 'hub-sidebar-css';
  style.textContent = `
    html, body { margin:0; padding:0; }
    body { display:flex !important; flex-direction:row !important; min-height:100vh; background:#080808; }

    /* ── Sidebar shell ── */
    #hubSidebar {
      width: 240px;
      min-width: 240px;
      max-width: 240px;
      height: 100vh;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      background: #0d0d0d;
      border-right: 1px solid rgba(201,168,76,0.08);
      display: flex !important;
      flex-direction: column !important;
      z-index: 50;
      overflow-y: auto;
      overflow-x: hidden;
      transition: transform 0.3s;
    }

    /* ── Logo ── */
    #hubSidebar .sb-logo {
      padding: 16px 16px 13px;
      border-bottom: 1px solid rgba(201,168,76,0.08);
      display: flex !important;
      flex-direction: row !important;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      flex-shrink: 0;
    }
    #hubSidebar .sb-logo-mark {
      width: 26px; height: 26px;
      border: 1px solid #c9a84c;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Mono', monospace;
      font-size: 11px; color: #c9a84c;
      flex-shrink: 0;
    }
    #hubSidebar .sb-logo-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px; font-weight: 600;
      letter-spacing: 0.08em;
      color: #f0ece4;
    }
    #hubSidebar .sb-logo-text span { color: #c9a84c; }

    /* ── User row ── */
    #hubSidebar .sb-user {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(201,168,76,0.08);
      display: flex !important;
      flex-direction: row !important;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    #hubSidebar .sb-user:hover { background: rgba(201,168,76,0.08); }
    #hubSidebar .sb-avatar {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.2);
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Mono', monospace;
      font-size: 11px; color: #c9a84c;
      font-weight: 500; flex-shrink: 0;
      overflow: hidden;
    }
    #hubSidebar .sb-uname {
      font-size: 12px; font-weight: 500;
      color: #f0ece4;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #hubSidebar .sb-uplan {
      font-family: 'DM Mono', monospace;
      font-size: 9px; color: #c9a84c;
      letter-spacing: 0.08em; text-transform: uppercase;
      margin-top: 1px;
    }

    /* ── Nav ── */
    #hubSidebar .sb-nav {
      flex: 1;
      padding: 6px 0;
      display: flex !important;
      flex-direction: column !important;
      overflow-y: auto;
    }
    #hubSidebar .sb-cat {
      font-family: 'DM Mono', monospace;
      font-size: 9px; color: #5a5648;
      letter-spacing: 0.15em; text-transform: uppercase;
      padding: 10px 16px 3px;
      display: block !important;
      white-space: nowrap;
    }
    #hubSidebar .sb-item {
      display: flex !important;
      flex-direction: row !important;
      align-items: center;
      gap: 9px;
      padding: 8px 16px;
      border-left: 2px solid transparent;
      color: #5a5648;
      font-size: 12px; font-weight: 400;
      text-decoration: none;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    #hubSidebar .sb-item:hover:not(.soon) {
      background: rgba(201,168,76,0.08);
      color: #a09880;
      border-left-color: rgba(201,168,76,0.3);
    }
    #hubSidebar .sb-item.active {
      background: rgba(201,168,76,0.1);
      color: #c9a84c;
      border-left-color: #c9a84c;
      font-weight: 500;
    }
    #hubSidebar .sb-item.soon {
      opacity: 0.45;
      cursor: default;
    }
    #hubSidebar .sb-icon {
      font-size: 13px;
      width: 16px;
      text-align: center;
      flex-shrink: 0;
    }
    #hubSidebar .sb-soon {
      margin-left: auto;
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      padding: 1px 5px;
      background: #111;
      border: 1px solid rgba(201,168,76,0.1);
      color: #5a5648;
      border-radius: 2px;
      flex-shrink: 0;
    }
    #hubSidebar .sb-divider {
      height: 1px;
      background: rgba(201,168,76,0.06);
      margin: 4px 0;
      display: block !important;
    }

    /* ── Bottom ── */
    #hubSidebar .sb-bottom {
      padding: 10px 14px;
      border-top: 1px solid rgba(201,168,76,0.08);
      flex-shrink: 0;
    }
    #hubSidebar .sb-signout {
      width: 100%;
      padding: 7px;
      background: transparent;
      border: 1px solid rgba(201,168,76,0.1);
      color: #5a5648;
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.2s;
    }
    #hubSidebar .sb-signout:hover {
      border-color: #e05c5c;
      color: #e05c5c;
    }

    /* ── Main content offset ── */
    .hub-main {
      margin-left: 240px !important;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* ── Mobile toggle ── */
    #hubMobileToggle {
      display: none;
      position: fixed;
      top: 12px; left: 12px;
      z-index: 60;
      width: 34px; height: 34px;
      background: #0d0d0d;
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 3px;
      cursor: pointer;
      align-items: center; justify-content: center;
      color: #a09880;
      font-size: 16px;
    }
    .hub-mob-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 45;
      backdrop-filter: blur(4px);
    }
    .hub-mob-overlay.open { display: block; }

    @media (max-width: 900px) {
      #hubSidebar { transform: translateX(-100%); }
      #hubSidebar.open { transform: translateX(0); }
      .hub-main { margin-left: 0 !important; }
      #hubMobileToggle { display: flex !important; }
    }
  `;
  document.head.appendChild(style);
})();

/* ── Render sidebar ── */
function renderHubSidebar(activePage, userName, userId) {
  const initials = (userName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const savedAvatar = localStorage.getItem('fe_av_' + userId);
  const avatarHtml = savedAvatar
    ? `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<span>${initials}</span>`;

  const sections = [
    {
      cat: 'Overview',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'hub.html' }]
    },
    {
      cat: 'Trading Journal',
      items: [{ id: 'journals', label: 'My Journals', icon: '📒', href: 'hub-journal.html' }]
    },
    {
      cat: 'Fundamental Analysis',
      items: [
        { id: 'news',     label: 'News Sentiment', icon: '📰', soon: true },
        { id: 'bias',     label: 'AI Bias Engine',  icon: '🤖', soon: true },
        { id: 'banks',    label: 'Central Banks',   icon: '🏦', soon: true },
        { id: 'calendar', label: 'Econ Calendar',   icon: '📅', soon: true }
      ]
    },
    {
      cat: 'Tools',
      items: [
        { id: 'calc',  label: 'Calculators',  icon: '🔧', soon: true },
        { id: 'corr',  label: 'Correlations', icon: '🔗', soon: true }
      ]
    },
    {
      cat: 'Academy',
      items: [
        { id: 'academy', label: 'Forex Academy', icon: '🎓', soon: true },
        { id: 'quizzes', label: 'Quizzes',       icon: '📝', soon: true }
      ]
    },
    {
      cat: 'Community',
      items: [{ id: 'mentor', label: 'Sign as Mentor', icon: '🏅', soon: true }]
    },
    {
      cat: 'Account',
      items: [{ id: 'profile', label: 'My Profile', icon: '👤', href: 'hub.html#profile' }]
    }
  ];

  let navHtml = '';
  sections.forEach(section => {
    navHtml += `<span class="sb-cat">${section.cat}</span>`;
    section.items.forEach(item => {
      if (item.soon) {
        navHtml += `<div class="sb-item soon"><span class="sb-icon">${item.icon}</span>${item.label}<span class="sb-soon">soon</span></div>`;
      } else {
        const isActive = item.id === activePage ? ' active' : '';
        navHtml += `<a href="${item.href}" class="sb-item${isActive}"><span class="sb-icon">${item.icon}</span>${item.label}</a>`;
      }
    });
    navHtml += `<div class="sb-divider"></div>`;
  });

  const html = `
    <a href="index.html" class="sb-logo">
      <div class="sb-logo-mark">FX</div>
      <div class="sb-logo-text">Forex<span>Edge</span></div>
    </a>
    <a href="hub.html#profile" class="sb-user">
      <div class="sb-avatar" id="hubAvatar">${avatarHtml}</div>
      <div>
        <div class="sb-uname">${userName || 'Trader'}</div>
        <div class="sb-uplan">Free Plan</div>
      </div>
    </a>
    <nav class="sb-nav">${navHtml}</nav>
    <div class="sb-bottom">
      <button class="sb-signout" onclick="hubSignOut()">← Sign Out</button>
    </div>
  `;

  const mount = document.getElementById('hubSidebarMount');
  if (!mount) { console.error('hubSidebarMount not found'); return; }

  // Create sidebar div
  const aside = document.createElement('aside');
  aside.id = 'hubSidebar';
  aside.innerHTML = html;
  mount.appendChild(aside);

  // Mobile toggle button
  const toggle = document.createElement('button');
  toggle.id = 'hubMobileToggle';
  toggle.textContent = '☰';
  document.body.appendChild(toggle);

  // Mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'hub-mob-overlay';
  overlay.id = 'hubMobOverlay';
  document.body.appendChild(overlay);

  toggle.addEventListener('click', () => {
    aside.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    aside.classList.remove('open');
    overlay.classList.remove('open');
  });
}

/* ── Init (auth + render) ── */
async function initHubSidebar(activePage) {
  const _sb = window.supabase.createClient(_HUB_SB_URL, _HUB_SB_KEY);
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'auth.html'; return null; }
  const user = session.user;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
  window._hubUser = user;
  window._hubSb = _sb;
  renderHubSidebar(activePage, name, user.id);

  // Topbar time
  const timeEl = document.getElementById('hubTime');
  if (timeEl) {
    const tick = () => timeEl.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    tick(); setInterval(tick, 1000);
  }
  return { user, sb: _sb };
}

async function hubSignOut() {
  await window._hubSb?.auth.signOut();
  window.location.href = 'index.html';
}
