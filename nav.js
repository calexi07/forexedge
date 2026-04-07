const _NAV_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _NAV_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

function renderNav(activePage) {
  const pages = [
    { id: 'index',   label: 'Home',    href: 'index.html' },
    { id: 'news',    label: 'News',    href: 'news.html' },
    { id: 'journal', label: 'Journal', href: 'journal.html' },
    { id: 'academy', label: 'Academy', href: 'academy.html' },
    { id: 'tools',   label: 'Tools',   href: 'tools.html' },
  ];
  const links = pages.map(p =>
    `<li><a href="${p.href}" class="nav-link ${activePage===p.id?'active':''}">${p.label}</a></li>`
  ).join('');

  document.getElementById('navMount').innerHTML = `
    <nav>
      <a href="index.html" class="nav-logo">
        <div style="width:28px;height:28px;background:linear-gradient(135deg,#c8a96e,#8a6a32);clip-path:polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">🦅</div>
        Eagle<span>Trader</span>
      </a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-cta" id="navCta">
        <a href="auth.html" class="btn-ghost">Sign In</a>
        <a href="auth.html?tab=register" class="btn-gold">Get Access →</a>
      </div>
      <button class="nav-burger" onclick="toggleMobileNav()" id="burger">☰</button>
    </nav>
    <div class="mobile-nav" id="mobileNav">
      ${pages.map(p=>`<a href="${p.href}" class="${activePage===p.id?'active':''}">${p.label}</a>`).join('')}
      <a href="auth.html?tab=register" style="color:var(--gold)" id="mobileAuthLink">Get Access →</a>
    </div>`;

  // Wait for Supabase to be ready then check auth
  waitForSupabase(checkNavAuthState);
}

function toggleMobileNav() {
  document.getElementById('mobileNav')?.classList.toggle('open');
}

// Retry until window.supabase is available (CDN might still be loading)
function waitForSupabase(callback, attempts=0) {
  if (window.supabase && window.supabase.createClient) {
    callback();
  } else if (attempts < 20) {
    setTimeout(() => waitForSupabase(callback, attempts + 1), 100);
  }
}

async function checkNavAuthState() {
  try {
    const _sb = window.supabase.createClient(_NAV_URL, _NAV_KEY);
    const { data: { session } } = await _sb.auth.getSession();
    if (!session?.user) return;

    const user = session.user;
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
    const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

    // Check both avatar key variants
    const savedAvatar = localStorage.getItem('et_av_'+user.id) || localStorage.getItem('fe_avatar_'+user.id);
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
        <button class="btn-gold" onclick="navSignOut()">Sign Out</button>`;
    }
    const ml = document.getElementById('mobileAuthLink');
    if (ml) { ml.href='hub.html'; ml.textContent='My Hub →'; }
  } catch(e) {
    console.warn('Nav auth check failed:', e);
  }
}

async function navSignOut() {
  try {
    const _sb = window.supabase.createClient(_NAV_URL, _NAV_KEY);
    await _sb.auth.signOut();
  } catch(e) {}
  window.location.href = 'index.html';
}

function openModal(view) { window.location.href = view==='register' ? 'auth.html?tab=register' : 'auth.html'; }
function closeModal(){} function switchModal(){} function renderModal(){} function updateNavAuth(){}
