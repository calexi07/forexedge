// ══════════════════════════════════════
// FOREXEDGE — Shared Navigation
// ══════════════════════════════════════

// Use existing config if already declared (e.g. supabase.js loaded first)
const _NAV_URL = (typeof SUPABASE_URL !== 'undefined') ? SUPABASE_URL : 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _NAV_KEY = (typeof SUPABASE_KEY !== 'undefined') ? SUPABASE_KEY : 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

function renderNav(activePage) {
  const pages = [
    { id: 'index',   label: 'Home',    href: 'index.html' },
    { id: 'news',    label: 'News',    href: 'news.html' },
    { id: 'journal', label: 'Journal', href: 'journal.html' },
    { id: 'academy', label: 'Academy', href: 'academy.html' },
    { id: 'tools',   label: 'Tools',   href: 'tools.html' },
  ];
  const links = pages.map(p => `
    <li><a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">${p.label}</a></li>
  `).join('');

  document.getElementById('navMount').innerHTML = `
    <nav>
      <a href="index.html" class="nav-logo">
        <div class="logo-mark">FX</div>
        Forex<span>Edge</span>
      </a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-cta" id="navCta">
        <a href="auth.html" class="btn-ghost">Sign In</a>
        <a href="auth.html?tab=register" class="btn-gold">Get Started →</a>
      </div>
      <button class="nav-burger" onclick="toggleMobileNav()" id="burger">☰</button>
    </nav>
    <div class="mobile-nav" id="mobileNav">
      ${pages.map(p => `<a href="${p.href}" class="${activePage === p.id ? 'active' : ''}">${p.label}</a>`).join('')}
      <a href="auth.html?tab=register" style="color:var(--gold)" id="mobileAuthLink">Get Started →</a>
    </div>
  `;
  checkNavAuthState();
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

async function checkNavAuthState() {
  try {
    if (!window.supabase) return;
    // Use existing client if available, otherwise create one
    const _sb = (typeof supabase !== 'undefined' && supabase.auth)
      ? supabase
      : window.supabase.createClient(_NAV_URL, _NAV_KEY);
    const { data: { session } } = await _sb.auth.getSession();
    if (!session?.user) return;
    const user = session.user;
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
    const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    const savedAvatar = localStorage.getItem('fe_avatar_' + user.id);
    const avatarHtml = savedAvatar
      ? `<img src="${savedAvatar}" style="width:26px;height:26px;border-radius:50%;object-fit:cover">`
      : `<span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--gold)">${initials}</span>`;
    const ctaEl = document.getElementById('navCta');
    if (ctaEl) {
      ctaEl.innerHTML = `
        <a href="hub.html" class="btn-ghost" style="display:inline-flex;align-items:center;gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">${avatarHtml}</div>
          My Hub
        </a>
        <button class="btn-gold" onclick="navSignOut()">Sign Out</button>
      `;
    }
    const ml = document.getElementById('mobileAuthLink');
    if (ml) { ml.href='hub.html'; ml.textContent='My Hub →'; }
  } catch(e) {
    console.warn('Nav auth check failed:', e);
  }
}

async function navSignOut() {
  try {
    if (!window.supabase) return;
    const _sb = (typeof supabase !== 'undefined' && supabase.auth)
      ? supabase
      : window.supabase.createClient(_NAV_URL, _NAV_KEY);
    await _sb.auth.signOut();
  } catch(e) {}
  window.location.href = 'index.html';
}

// Legacy compatibility
function openModal(view) { window.location.href = view==='register' ? 'auth.html?tab=register' : 'auth.html'; }
function closeModal() {}
function switchModal() {}
function renderModal() {}
function updateNavAuth() {}
