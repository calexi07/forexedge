/* ══════════════════════════════════════
   FOREXEDGE — Hub Shared Sidebar
   Include this on every hub page:
   <script src="hub-sidebar.js"></script>
   <script>initHubSidebar('journals');</script>
══════════════════════════════════════ */

const _HUB_SB_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _HUB_SB_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

function renderHubSidebar(activePage, userName, userEmail, userId) {
  const initials = (userName || 'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const savedAvatar = localStorage.getItem('fe_av_' + userId);
  const avatarHtml = savedAvatar
    ? `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<span>${initials}</span>`;

  const nav = [
    { cat: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'hub.html' }
    ]},
    { cat: 'Trading Journal', items: [
      { id: 'journals', label: 'My Journals', icon: '📒', href: 'hub-journal.html' }
    ]},
    { cat: 'Fundamental Analysis', items: [
      { id: 'news',     label: 'News Sentiment', icon: '📰', soon: true },
      { id: 'bias',     label: 'AI Bias Engine',  icon: '🤖', soon: true },
      { id: 'banks',    label: 'Central Banks',   icon: '🏦', soon: true },
      { id: 'calendar', label: 'Econ Calendar',   icon: '📅', soon: true }
    ]},
    { cat: 'Tools', items: [
      { id: 'calculators',  label: 'Calculators',  icon: '🔧', soon: true },
      { id: 'correlations', label: 'Correlations', icon: '🔗', soon: true }
    ]},
    { cat: 'Academy', items: [
      { id: 'academy', label: 'Forex Academy', icon: '🎓', soon: true },
      { id: 'quizzes', label: 'Quizzes',       icon: '📝', soon: true }
    ]},
    { cat: 'Community', items: [
      { id: 'mentor', label: 'Sign as Mentor', icon: '🏅', soon: true }
    ]},
    { cat: 'Account', items: [
      { id: 'profile', label: 'My Profile', icon: '👤', href: 'hub.html#profile' }
    ]}
  ];

  let navHtml = '';
  nav.forEach(section => {
    navHtml += `<div class="hub-nav-cat">${section.cat}</div>`;
    section.items.forEach(item => {
      if (item.soon) {
        navHtml += `<div class="hub-nav-item soon"><span class="hub-nav-icon">${item.icon}</span>${item.label}<span class="hub-soon-tag">soon</span></div>`;
      } else {
        const active = item.id === activePage ? ' active' : '';
        navHtml += `<a href="${item.href}" class="hub-nav-item${active}"><span class="hub-nav-icon">${item.icon}</span>${item.label}</a>`;
      }
    });
    navHtml += `<div class="hub-nav-divider"></div>`;
  });

  const html = `
<aside class="hub-sidebar" id="hubSidebar">
  <a href="index.html" class="hub-sidebar-logo">
    <div class="hub-logo-mark">FX</div>
    <div class="hub-logo-text">Forex<span>Edge</span></div>
  </a>
  <a href="hub.html#profile" class="hub-sidebar-user">
    <div class="hub-u-avatar" id="hubAvatar">${avatarHtml}</div>
    <div class="hub-u-info">
      <div class="hub-u-name">${userName || 'Trader'}</div>
      <div class="hub-u-plan">Free Plan</div>
    </div>
  </a>
  <nav class="hub-nav">${navHtml}</nav>
  <div class="hub-sidebar-bottom">
    <button class="hub-signout-btn" onclick="hubSignOut()">← Sign Out</button>
  </div>
</aside>
<button class="hub-mobile-toggle" id="hubMobileToggle">☰</button>
<div class="hub-mobile-overlay" id="hubMobileOverlay"></div>
  `;

  const mount = document.getElementById('hubSidebarMount');
  if (mount) mount.innerHTML = html;

  // Mobile toggle
  document.getElementById('hubMobileToggle')?.addEventListener('click', () => {
    document.getElementById('hubSidebar').classList.toggle('open');
    document.getElementById('hubMobileOverlay').classList.toggle('open');
  });
  document.getElementById('hubMobileOverlay')?.addEventListener('click', () => {
    document.getElementById('hubSidebar').classList.remove('open');
    document.getElementById('hubMobileOverlay').classList.remove('open');
  });
}

async function initHubSidebar(activePage) {
  // Guard: redirect if not logged in
  const _sb = window.supabase.createClient(_HUB_SB_URL, _HUB_SB_KEY);
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'auth.html'; return; }
  const user = session.user;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
  window._hubUser = user;
  window._hubSb = _sb;
  renderHubSidebar(activePage, name, user.email, user.id);
  // Update time in topbar if present
  const timeEl = document.getElementById('hubTime');
  if (timeEl) {
    const tick = () => timeEl.textContent = new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    tick(); setInterval(tick, 1000);
  }
  return { user, sb: _sb };
}

async function hubSignOut() {
  await window._hubSb?.auth.signOut();
  window.location.href = 'index.html';
}
