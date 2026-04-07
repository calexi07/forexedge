/* EagleTrader — Hub Sidebar (no inline CSS — uses hub.css) */
const _HUB_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _HUB_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

function renderEtSidebar(activePage, userName, userId) {
  const ini = (userName||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const av = localStorage.getItem('et_av_'+userId);
  const avHtml = av ? `<img src="${av}">` : `<span>${ini}</span>`;

  const sections = [
    { cat:'Overview', items:[
      { id:'dashboard', label:'Dashboard', icon:'📊', href:'hub.html' }
    ]},
    { cat:'Trading Journal', items:[
      { id:'journals', label:'My Journals', icon:'📒', href:'hub-journal.html' }
    ]},
    { cat:'Fundamental Analysis', items:[
      { id:'news',     label:'News Sentiment', icon:'📰', soon:true },
      { id:'bias',     label:'AI Bias Engine',  icon:'🤖', soon:true },
      { id:'banks',    label:'Central Banks',   icon:'🏦', soon:true },
      { id:'calendar', label:'Econ Calendar',   icon:'📅', soon:true }
    ]},
    { cat:'Tools', items:[
      { id:'calc', label:'Calculators',  icon:'🔧', soon:true },
      { id:'corr', label:'Correlations', icon:'🔗', soon:true }
    ]},
    { cat:'Academy', items:[
      { id:'academy', label:'Forex Academy', icon:'🎓', soon:true },
      { id:'quizzes', label:'Quizzes',       icon:'📝', soon:true }
    ]},
    { cat:'Community', items:[
      { id:'mentor', label:'Sign as Mentor', icon:'🏅', soon:true }
    ]},
    { cat:'Account', items:[
      { id:'profile', label:'My Profile', icon:'👤', href:'hub.html#profile' }
    ]}
  ];

  let navHtml = '';
  sections.forEach(sec => {
    navHtml += `<span class="et-cat">${sec.cat}</span>`;
    sec.items.forEach(item => {
      if (item.soon) {
        navHtml += `<div class="et-item soon"><span class="et-icon">${item.icon}</span>${item.label}<span class="et-soon-tag">soon</span></div>`;
      } else {
        const cls = item.id === activePage ? ' active' : '';
        navHtml += `<a href="${item.href}" class="et-item${cls}"><span class="et-icon">${item.icon}</span>${item.label}</a>`;
      }
    });
    navHtml += `<div class="et-divider"></div>`;
  });

  const html = `
    <a href="index.html" class="et-logo">
      <div class="et-logo-mark">🦅</div>
      <div class="et-logo-name">Eagle<span>Trader</span></div>
    </a>
    <a href="hub.html#profile" class="et-user">
      <div class="et-avatar" id="etAvatar">${avHtml}</div>
      <div>
        <div class="et-uname">${userName||'Trader'}</div>
        <div class="et-uplan">Free Plan</div>
      </div>
    </a>
    <nav class="et-nav">${navHtml}</nav>
    <div class="et-sidebar-bottom">
      <button class="et-signout" onclick="etSignOut()">← Sign Out</button>
    </div>`;

  const mount = document.getElementById('etSidebarMount');
  if (!mount) return;
  const aside = document.createElement('aside');
  aside.id = 'etSidebar';
  aside.innerHTML = html;
  mount.appendChild(aside);

  // Mobile toggle
  const toggle = document.createElement('button');
  toggle.id = 'etMobileToggle'; toggle.textContent = '☰';
  document.body.appendChild(toggle);
  const overlay = document.createElement('div');
  overlay.className = 'et-mob-overlay'; overlay.id = 'etMobOverlay';
  document.body.appendChild(overlay);
  toggle.addEventListener('click', () => { aside.classList.toggle('open'); overlay.classList.toggle('open'); });
  overlay.addEventListener('click', () => { aside.classList.remove('open'); overlay.classList.remove('open'); });
}

async function initEtSidebar(activePage) {
  const _sb = window.supabase.createClient(_HUB_URL, _HUB_KEY);
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'auth.html'; return null; }
  const user = session.user;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
  window._etUser = user; window._etSb = _sb;
  renderEtSidebar(activePage, name, user.id);
  const timeEl = document.getElementById('etTime');
  if (timeEl) { const t=()=>timeEl.textContent=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}); t(); setInterval(t,1000); }
  // Hide loader
  hideLoader();
  return { user, sb: _sb };
}

async function etSignOut() { await window._etSb?.auth.signOut(); window.location.href = 'index.html'; }
function etOpenModal(id)  { document.getElementById(id)?.classList.add('active'); document.body.style.overflow='hidden'; }
function etCloseModal(id) { document.getElementById(id)?.classList.remove('active'); document.body.style.overflow=''; }

function hideLoader() {
  const loader = document.getElementById('et-loader');
  if (loader) {
    loader.classList.add('hidden');
    document.body.classList.remove('et-loading');
  }
}
