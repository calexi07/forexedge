/* EaglePips — Universal Nav v2 */
const _NAV_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _NAV_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';
let _navSB = null;
function getNavSB(){ if(!_navSB && window.supabase) _navSB = window.supabase.createClient(_NAV_URL, _NAV_KEY); return _navSB; }

async function renderNav(activePage) {
  // Inject nav CSS — use #_nav prefix to beat any styles.css specificity
  if (!document.getElementById('_navCss')) {
    const s = document.createElement('style');
    s.id = '_navCss';
    s.textContent = `
      #_nav{position:sticky!important;top:0!important;z-index:900!important;display:flex!important;align-items:center!important;gap:0!important;padding:0 40px!important;height:110px!important;background:rgba(8,9,12,0.95)!important;backdrop-filter:blur(20px)!important;border-bottom:1px solid rgba(255,255,255,0.06)!important;box-sizing:border-box!important;width:100%!important}
      #_nav .nav-logo{display:flex!important;align-items:center!important;gap:0!important;text-decoration:none!important;margin-right:48px!important;flex-shrink:0!important;border-bottom:none!important}
      #_nav .nav-logo span{display:none!important}
      #_nav .nav-logo-mark{width:32px!important;height:32px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;background:none!important;clip-path:none!important}
      #_nav .nav-links{display:flex!important;list-style:none!important;gap:0!important;margin:0!important;padding:0!important;align-items:center!important}
      #_nav .nav-link{font-family:'Syne',sans-serif!important;font-size:11px!important;font-weight:700!important;letter-spacing:0.1em!important;text-transform:uppercase!important;color:#7a7570!important;text-decoration:none!important;padding:6px 14px!important;border-radius:3px!important;transition:color 0.2s!important;border-bottom:none!important}
      #_nav .nav-link:hover{color:#c8c4bc!important;border-bottom:none!important}
      #_nav .nav-link.active{color:#c8a96e!important;border-bottom:none!important}
      #_nav .nav-cta{display:flex!important;align-items:center!important;gap:8px!important;margin-left:auto!important}
      #_nav .btn-ghost{font-family:'Syne',sans-serif!important;font-size:11px!important;font-weight:700!important;letter-spacing:0.08em!important;padding:8px 16px!important;background:transparent!important;border:1px solid rgba(255,255,255,0.12)!important;color:#c8c4bc!important;text-decoration:none!important;border-radius:3px!important;transition:all 0.2s!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;gap:6px!important}
      #_nav .btn-ghost:hover{border-color:rgba(200,169,110,0.3)!important;color:#c8a96e!important}
      #_nav .btn-gold{font-family:'Syne',sans-serif!important;font-size:11px!important;font-weight:700!important;letter-spacing:0.08em!important;padding:8px 18px!important;background:#c8a96e!important;border:1px solid #c8a96e!important;color:#08090c!important;text-decoration:none!important;border-radius:3px!important;transition:all 0.2s!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;gap:6px!important}
      #_nav .btn-gold:hover{background:#e8cc94!important;border-color:#e8cc94!important}
      #_navBurger{display:none!important;background:none!important;border:1px solid rgba(255,255,255,0.1)!important;color:#c8c4bc!important;width:34px!important;height:34px!important;border-radius:3px!important;cursor:pointer!important;font-size:15px!important;margin-left:auto!important;align-items:center!important;justify-content:center!important}
      #_mobileNav{display:none;flex-direction:column;background:#08090c;border-bottom:1px solid rgba(255,255,255,0.06);padding:12px 20px;gap:4px}
      #_mobileNav a{font-family:'Syne',sans-serif!important;font-size:12px!important;font-weight:600!important;letter-spacing:0.08em!important;text-transform:uppercase!important;color:#7a7570!important;text-decoration:none!important;padding:10px 0!important;border-bottom:1px solid rgba(255,255,255,0.04)!important}
      #_mobileNav a:hover,#_mobileNav a.active{color:#c8a96e!important}
      #_mobileNav.open{display:flex!important}
      @media(max-width:860px){
        #_nav{padding:0 16px!important}
        #_nav .nav-links{display:none!important}
        #_nav .btn-ghost:not(.hub-link){display:none!important}
        #_navBurger{display:flex!important}
      }
    `;
    document.head.appendChild(s);
  }

  // Load nav items from DB
  let navItems = [];
  try {
    const _sb = getNavSB(); if(!_sb) return;
    const { data } = await _sb.from('nav_items').select('*').eq('active', true).order('sort_order', { ascending: true });
    navItems = data || [];
  } catch(e) {}

  const defaults = [
    { id: 'home', label: 'Home', url: 'index.html' },
    { id: 'updates', label: 'Market Updates', url: 'market-updates.html' },
    { id: 'academy', label: 'Academy', url: 'academy.html', children: [
      { id: 'glossary', label: '📖 Glossary', url: 'academy.html' },
      { id: 'eagle-academy', label: '🦅 Eagle Academy', url: 'eagle-academy.html' },
    ]},
    { id: 'community', label: 'Community', url: 'community.html', children: [
      { id: 'contest', label: '🏆 Contest', url: 'community.html#contest' },
      { id: 'leaderboard', label: '📊 Leaderboard', url: 'community.html#leaderboard' },
      { id: 'achievements', label: '🎖 Achievements', url: 'community.html#achievements' },
    ]},
  ];
  const roots = navItems.filter(n => !n.parent_id);
  // Merge default children into DB items (DB may not have children configured)
  const items = roots.length ? roots.map(item => {
    const defaultItem = defaults.find(d => d.url === item.url || d.id === item.id);
    return defaultItem?.children ? { ...item, children: defaultItem.children } : item;
  }) : defaults;

  function isActive(item) {
    if (!activePage) return false;
    return item.url?.includes(activePage) || item.label?.toLowerCase().replace(/\s+/g,'-').includes(activePage);
  }

  function buildLinks(items) {
    return items.map(item => {
      const dbChildren = navItems.filter(n => n.parent_id === item.id);
      const children = dbChildren.length ? dbChildren : (item.children || []);
      const active = isActive(item);
      if (!children.length) {
        return `<li><a href="${item.url}" class="nav-link${active?' active':''}"${item.open_new_tab?' target="_blank"':''}>${item.label}</a></li>`;
      }
      const ddStyle = `position:absolute;top:100%;left:0;background:#0c0e13;border:1px solid rgba(200,169,110,0.15);border-radius:4px;min-width:200px;padding:6px 0;display:none;z-index:200;box-shadow:0 16px 40px rgba(0,0,0,0.5);padding-top:8px`;
      const subStyle = `display:block;padding:9px 14px;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.05em;color:#a09880;text-decoration:none;transition:all 0.15s`;
      const subs = children.map(c => `<a href="${c.url}" style="${subStyle}" onmouseover="this.style.background='rgba(200,169,110,0.08)';this.style.color='#c8c4bc'" onmouseout="this.style.background='';this.style.color='#a09880'"${c.open_new_tab?' target="_blank"':''}>${c.label}</a>`).join('');
      const liId = 'navdd-' + item.id;
      return `<li style="position:relative" id="${liId}"
        onmouseenter="document.getElementById('${liId}').querySelector('.nav-dd').style.display='block'"
        onmouseleave="document.getElementById('${liId}').querySelector('.nav-dd').style.display='none'">
        <a href="${item.url}" class="nav-link${active?' active':''}">${item.label} <span style="font-size:9px;opacity:0.5">▾</span></a>
        <div class="nav-dd" style="${ddStyle}">${subs}</div>
      </li>`;
    }).join('');
  }

  function buildMobile(items) {
    return items.map(item => {
      const dbChildren = navItems.filter(n => n.parent_id === item.id);
      const children = dbChildren.length ? dbChildren : (item.children || []);
      const active = isActive(item);
      let html = `<a href="${item.url}"${active?' class="active"':''}${item.open_new_tab?' target="_blank"':''}>${item.label}</a>`;
      if (children.length) {
        html += children.map(c => `<a href="${c.url}" style="padding-left:24px;font-size:11px;opacity:0.7">${c.label}</a>`).join('');
      }
      return html;
    }).join('');
  }

  const mount = document.getElementById('navMount');
  if (!mount) return;

  mount.innerHTML = `
    <nav id="_nav">
      <a href="index.html" class="nav-logo">
        <img src="https://vaimxhgqcdhjhdiaampa.supabase.co/storage/v1/object/public/EaglePips/design-f-r--titlu-1776494279309.png" style="height:100px;width:auto;object-fit:contain;flex-shrink:0;filter:brightness(1.4) drop-shadow(0 2px 12px rgba(200,169,110,0.6))" alt="EaglePips">
      </a>
      <ul class="nav-links" id="_navLinks">${buildLinks(items)}</ul>
      <div class="nav-cta" id="navCta">
        <a href="auth.html" class="btn-ghost">Sign In</a>
        <a href="auth.html?tab=register" class="btn-gold">Get Access →</a>
      </div>
      <button id="_navBurger" onclick="document.getElementById('_mobileNav').classList.toggle('open')">☰</button>
    </nav>
    <div id="_mobileNav">
      ${buildMobile(items)}
      <a href="auth.html?tab=register" style="color:#c8a96e!important;font-family:'Syne',sans-serif!important;font-size:12px!important;font-weight:700!important;letter-spacing:0.08em!important;text-decoration:none!important;padding:10px 0!important;border-bottom:none!important" id="_mobileAuth">Get Access →</a>
    </div>`;

  _checkNavAuth();
}

async function _checkNavAuth() {
  try {
    const _sb = getNavSB(); if(!_sb) return;
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
  try { const _sb = getNavSB(); if(!_sb) return; await _sb.auth.signOut(); } catch(e) {}
  window.location.href = 'index.html';
}

// Legacy compatibility
function waitForSupabase(cb, n=0) { window.supabase?.createClient ? cb() : n < 30 ? setTimeout(() => waitForSupabase(cb, n+1), 100) : null; }
function checkNavAuthState() { _checkNavAuth(); }
function toggleMobileNav() { document.getElementById('_mobileNav')?.classList.toggle('open'); }
function openModal(v) { window.location.href = v === 'register' ? 'auth.html?tab=register' : 'auth.html'; }
function closeModal(){} function switchModal(){} function renderModal(){} function updateNavAuth(){}
