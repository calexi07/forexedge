/* EaglePips — Universal Nav */
const _NAV_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _NAV_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

async function renderNav(activePage) {
  // Inject nav CSS if not already present (pages that don't have styles.css)
  if (!document.getElementById('_navCss')) {
    const s = document.createElement('style');
    s.id = '_navCss';
    s.textContent = `
      nav{position:sticky;top:0;z-index:900;display:flex;align-items:center;gap:0;padding:0 32px;height:62px;background:rgba(8,9,12,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06)}
      .nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.02em;margin-right:32px;flex-shrink:0}
      .nav-logo span{color:#c8a96e;font-style:italic}
      .nav-logo-mark{width:28px;height:28px;background:linear-gradient(135deg,#c8a96e,#8a6a32);clip-path:polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
      .nav-links{display:flex;list-style:none;gap:0;margin:0;padding:0;align-items:center}
      .nav-link{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a7570;text-decoration:none;padding:6px 14px;border-radius:3px;transition:color 0.2s,background 0.2s}
      .nav-link:hover{color:#c8c4bc}
      .nav-link.active{color:#c8a96e}
      .nav-cta{display:flex;align-items:center;gap:8px;margin-left:auto}
      .btn-ghost{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:8px 16px;background:transparent;border:1px solid rgba(255,255,255,0.12);color:#c8c4bc;text-decoration:none;border-radius:3px;transition:all 0.2s;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
      .btn-ghost:hover{border-color:rgba(200,169,110,0.3);color:#c8a96e}
      .btn-gold{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:8px 18px;background:#c8a96e;border:1px solid #c8a96e;color:#08090c;text-decoration:none;border-radius:3px;transition:all 0.2s;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
      .btn-gold:hover{background:#e8cc94;border-color:#e8cc94}
      .nav-burger{display:none;background:none;border:1px solid rgba(255,255,255,0.1);color:#c8c4bc;width:34px;height:34px;border-radius:3px;cursor:pointer;font-size:15px;margin-left:auto;align-items:center;justify-content:center}
      .mobile-nav{display:none;flex-direction:column;background:#08090c;border-bottom:1px solid rgba(255,255,255,0.06);padding:12px 20px;gap:4px}
      .mobile-nav a{font-family:'Syne',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7a7570;text-decoration:none;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
      .mobile-nav a:hover,.mobile-nav a.active{color:#c8a96e}
      .mobile-nav.open{display:flex}
      @media(max-width:860px){
        nav{padding:0 16px}
        .nav-links{display:none}
        .nav-cta .btn-ghost:not(.hub-link){display:none}
        .nav-burger{display:flex}
      }
    `;
    document.head.appendChild(s);
  }

  // Build nav links from DB, fallback to defaults
  let navItems = [];
  try {
    const _sb = window.supabase.createClient(_NAV_URL, _NAV_KEY);
    const { data } = await _sb.from('nav_items').select('*').eq('active', true).order('sort_order', { ascending: true });
    navItems = data || [];
  } catch(e) {}

  const defaults = [
    { label: 'Home', url: 'index.html' },
    { label: 'Market Updates', url: 'market-updates.html' },
  ];
  const items = navItems.length ? navItems.filter(n => !n.parent_id) : defaults;

  // Build links with dropdown support
  function buildLinks(items, mobile = false) {
    return items.map(item => {
      const children = navItems.filter(n => n.parent_id === item.id);
      const isActive = activePage && (item.url?.includes(activePage) || item.label?.toLowerCase().includes(activePage));
      if (mobile || !children.length) {
        return `<${mobile ? 'a href="' + item.url + '"' : 'li'}${mobile ? ' class="' + (isActive ? 'active' : '') + '"' : ''}>
          ${mobile ? item.label : `<a href="${item.url}" class="nav-link${isActive ? ' active' : ''}"${item.open_new_tab ? ' target="_blank"' : ''}>${item.label}</a>`}
        </${mobile ? 'a' : 'li'}>`;
      }
      // Dropdown
      const ddStyle = `position:absolute;top:calc(100% + 4px);left:0;background:#0c0e13;border:1px solid rgba(200,169,110,0.15);border-radius:4px;min-width:180px;padding:4px 0;display:none;z-index:200;box-shadow:0 16px 40px rgba(0,0,0,0.5)`;
      const subStyle = `display:block;padding:9px 14px;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.05em;color:#a09880;text-decoration:none;transition:all 0.15s`;
      const subs = children.map(c => `<a href="${c.url}" style="${subStyle}" onmouseover="this.style.background='rgba(200,169,110,0.08)';this.style.color='#c8c4bc'" onmouseout="this.style.background='';this.style.color='#a09880'"${c.open_new_tab ? ' target="_blank"' : ''}>${c.label}</a>`).join('');
      return `<li style="position:relative" onmouseover="this.querySelector('.nav-dd').style.display='block'" onmouseout="this.querySelector('.nav-dd').style.display='none'">
        <a href="${item.url}" class="nav-link${isActive ? ' active' : ''}">${item.label} <span style="font-size:9px;opacity:0.5">▾</span></a>
        <div class="nav-dd" style="${ddStyle}">${subs}</div>
      </li>`;
    }).join('');
  }

  const mount = document.getElementById('navMount');
  if (!mount) return;

  mount.innerHTML = `
    <nav id="_nav">
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-mark">🦅</div>
        Eagle<span>Pips</span>
      </a>
      <ul class="nav-links" id="_navLinks">${buildLinks(items)}</ul>
      <div class="nav-cta" id="navCta">
        <a href="auth.html" class="btn-ghost">Sign In</a>
        <a href="auth.html?tab=register" class="btn-gold">Get Access →</a>
      </div>
      <button class="nav-burger" id="_burger" onclick="document.getElementById('_mobileNav').classList.toggle('open')">☰</button>
    </nav>
    <div class="mobile-nav" id="_mobileNav">
      ${buildLinks(items, true)}
      <a href="auth.html?tab=register" style="color:var(--gold,#c8a96e);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-decoration:none;padding:10px 0;border-bottom:none" id="_mobileAuth">Get Access →</a>
    </div>`;

  // Check auth state
  _checkNavAuth();
}

async function _checkNavAuth() {
  try {
    const _sb = window.supabase.createClient(_NAV_URL, _NAV_KEY);
    const { data: { session } } = await _sb.auth.getSession();
    if (!session?.user) return;
    const user = session.user;
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const savedAvatar = localStorage.getItem('et_av_' + user.id);
    const avatarHtml = savedAvatar
      ? `<img src="${savedAvatar}" style="width:26px;height:26px;border-radius:50%;object-fit:cover">`
      : `<span style="font-family:'DM Mono',monospace;font-size:11px;color:#c8a96e">${initials}</span>`;
    const isAdmin = user.user_metadata?.is_admin === true;
    const cta = document.getElementById('navCta');
    if (cta) {
      cta.innerHTML = `
        <a href="hub.html" class="btn-ghost hub-link" style="gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:rgba(200,169,110,0.1);border:1px solid rgba(200,169,110,0.2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">${avatarHtml}</div>
          My Hub
        </a>
        ${isAdmin ? '<a href="admin.html" class="btn-ghost" style="font-size:11px;padding:6px 12px">⚙️ Admin</a>' : ''}
        <button class="btn-ghost" onclick="_navSignOut()" style="font-size:11px">Sign Out</button>`;
    }
    const mob = document.getElementById('_mobileAuth');
    if (mob) { mob.href = 'hub.html'; mob.textContent = 'My Hub →'; }
  } catch(e) {}
}

async function _navSignOut() {
  try { const _sb = window.supabase.createClient(_NAV_URL, _NAV_KEY); await _sb.auth.signOut(); } catch(e) {}
  window.location.href = 'index.html';
}

// Legacy compatibility
function waitForSupabase(cb, n=0) { window.supabase ? cb() : n < 30 ? setTimeout(() => waitForSupabase(cb, n+1), 100) : null; }
function checkNavAuthState() { _checkNavAuth(); }
function toggleMobileNav() { document.getElementById('_mobileNav')?.classList.toggle('open'); }
function openModal(v) { window.location.href = v === 'register' ? 'auth.html?tab=register' : 'auth.html'; }
function closeModal(){} function switchModal(){} function renderModal(){} function updateNavAuth(){}
