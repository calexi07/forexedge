/* EaglePips — Hub Sidebar */
const _HUB_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const _HUB_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

function renderEtSidebar(activePage, userName, userId, journals=[], activeAnalyses=[]) {
  const ini = (userName||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const av = localStorage.getItem('et_av_'+userId);
  const avHtml = av ? `<img src="${av}">` : `<span>${ini}</span>`;

  // Build journals sub-items
  let journalItems = '';
  if (journals.length) {
    const typeIcon = {live:'✅',p2:'🎯',p1:'⚡',personal:'💼'};
    journals.forEach(j => {
      const isActive = activePage === 'journal-'+j.id ? ' active' : '';
      journalItems += `<a href="hub-journal-detail.html?id=${j.id}" class="et-item et-sub${isActive}">
        <span class="et-icon" style="font-size:11px">${typeIcon[j.type]||'📒'}</span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${j.name}</span>
      </a>`;
    });
  }

  // Build active analyses sub-items
  let analysisItems = '';
  if (activeAnalyses.length) {
    const biasIcon = {bullish:'🟢',bearish:'🔴',neutral:'🟡'};
    activeAnalyses.slice(0, 8).forEach(a => {
      const isActive = activePage === 'analysis-'+a.id ? ' active' : '';
      const icon = biasIcon[a.bias] || '📊';
      analysisItems += `<a href="hub-analyses.html" class="et-item et-sub${isActive}" onclick="event.preventDefault();history.pushState(null,'','hub-analyses.html');window.location.reload()">
        <span class="et-icon" style="font-size:11px">${icon}</span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px">${a.pair}</span>
        <span style="font-family:\'DM Mono\',monospace;font-size:8px;color:var(--white3);margin-left:auto;white-space:nowrap">${a.date?.slice(5)||''}</span>
      </a>`;
    });
  }

  const html = `
    <a href="index.html" class="et-logo">
      <img src="https://vaimxhgqcdhjhdiaampa.supabase.co/storage/v1/object/public/EaglePips/5ea59b4e-0457-450f-bce1-b5389c0a97fa-1776493148502.png" style="width:28px;height:28px;object-fit:contain;flex-shrink:0" alt="EaglePips">
      <div class="et-logo-name">Eagle<span>Pips</span></div>
    </a>
    <a href="hub.html#profile" class="et-user">
      <div class="et-avatar" id="etAvatar">${avHtml}</div>
      <div>
        <div class="et-uname">${userName||'Trader'}</div>
        
      </div>
    </a>
    <nav class="et-nav">
      <span class="et-cat">Overview</span>
      <a href="hub.html" class="et-item${activePage==='dashboard'?' active':''}">
        <span class="et-icon">📊</span>Dashboard
      </a>
      <div class="et-divider"></div>

      <span class="et-cat">Trading Journal</span>
      <a href="hub-journal.html" class="et-item${activePage==='journals'?' active':''}">
        <span class="et-icon">📒</span>My Journals
      </a>
      ${journalItems}
      <div class="et-divider"></div>

      <span class="et-cat">Analyses</span>
      <a href="hub-analyses.html" class="et-item${activePage==='analyses'?' active':''}">
        <span class="et-icon">📊</span>All Analyses
      </a>
      ${analysisItems}
      <div class="et-divider"></div>

      <span class="et-cat">Strategies</span>
      <a href="hub-strategies.html" class="et-item${activePage==='strategies'?' active':''}">
        <span class="et-icon">⚡</span>My Strategies
      </a>
      <div class="et-divider"></div>

      <span class="et-cat">Payouts</span>
      <a href="hub-payouts.html" class="et-item${activePage==='payouts'?' active':''}">
        <span class="et-icon">💸</span>My Payouts
      </a>
      <div class="et-divider"></div>

      <span class="et-cat">Coming Soon</span>
      <div class="et-item soon"><span class="et-icon">📰</span>News Sentiment<span class="et-soon-tag">soon</span></div>
      <div class="et-item soon"><span class="et-icon">🤖</span>AI Bias Engine<span class="et-soon-tag">soon</span></div>
      <div class="et-item soon"><span class="et-icon">🏦</span>Central Banks<span class="et-soon-tag">soon</span></div>
      <div class="et-item soon"><span class="et-icon">🎓</span>Academy<span class="et-soon-tag">soon</span></div>
      <div class="et-item soon"><span class="et-icon">🏅</span>Mentor Hub<span class="et-soon-tag">soon</span></div>
      <div class="et-divider"></div>

      <span class="et-cat">Account</span>
      <a href="hub.html#profile" class="et-item${activePage==='profile'?' active':''}">
        <span class="et-icon">👤</span>My Profile
      </a>
    </nav>
    <div class="et-sidebar-bottom">
      <button class="et-signout" onclick="etSignOut()">← Sign Out</button>
    </div>`;

  const mount = document.getElementById('etSidebarMount');
  if (!mount) return;
  let aside = document.getElementById('etSidebar');
  if (!aside) {
    aside = document.createElement('aside');
    aside.id = 'etSidebar';
    mount.appendChild(aside);
  }
  aside.innerHTML = html;

  // Mobile toggle
  if (!document.getElementById('etMobileToggle')) {
    const toggle = document.createElement('button');
    toggle.id = 'etMobileToggle'; toggle.textContent = '☰';
    document.body.appendChild(toggle);
    const overlay = document.createElement('div');
    overlay.className = 'et-mob-overlay'; overlay.id = 'etMobOverlay';
    document.body.appendChild(overlay);
    toggle.addEventListener('click', () => { aside.classList.toggle('open'); overlay.classList.toggle('open'); });
    overlay.addEventListener('click', () => { aside.classList.remove('open'); overlay.classList.remove('open'); });
  }
}

async function initEtSidebar(activePage) {
  const _sb = window.supabase.createClient(_HUB_URL, _HUB_KEY);
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'auth.html'; return null; }
  const user = session.user;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader';
  window._etUser = user; window._etSb = _sb;

  // Load journals for sidebar
  const { data: journals } = await _sb.from('journals').select('id,name,type').eq('user_id', user.id).order('created_at', { ascending: true });
  window._etJournals = journals || [];

  // Load active analyses for sidebar
  const now = new Date();
  const threeDaysAgo = new Date(now - 3*24*60*60*1000).toISOString().split('T')[0];
  const { data: activeAnalyses } = await _sb.from('analyses')
    .select('id,pair,bias,date')
    .eq('user_id', user.id)
    .gte('date', threeDaysAgo)
    .eq('status', 'active')
    .order('date', { ascending: false })
    .limit(8);

  renderEtSidebar(activePage, name, user.id, journals || [], activeAnalyses || []);

  const timeEl = document.getElementById('etTime');
  if (timeEl) { const t=()=>timeEl.textContent=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}); t(); setInterval(t,1000); }
  hideLoader();
  return { user, sb: _sb };
}

// Call this after creating/deleting a journal to refresh sidebar
async function refreshSidebarJournals() {
  if (!window._etSb || !window._etUser) return;
  const { data } = await window._etSb.from('journals').select('id,name,type').eq('user_id', window._etUser.id).order('created_at', { ascending: true });
  window._etJournals = data || [];
  const activePage = document.body.dataset.activePage || '';
  const name = window._etUser.user_metadata?.full_name || window._etUser.email?.split('@')[0] || 'Trader';
  const nowR = new Date();
  const threeDaysAgoR = new Date(nowR - 3*24*60*60*1000).toISOString().split('T')[0];
  const { data: activeAn } = await window._etSb.from('analyses')
    .select('id,pair,bias,date').eq('user_id', window._etUser.id)
    .gte('date', threeDaysAgoR).eq('status','active')
    .order('date', { ascending: false }).limit(8);
  renderEtSidebar(activePage, name, window._etUser.id, data || [], activeAn || []);
}

async function etSignOut() { await window._etSb?.auth.signOut(); window.location.href = 'index.html'; }
function etOpenModal(id)  { document.getElementById(id)?.classList.add('active'); document.body.style.overflow='hidden'; }
function etCloseModal(id) { document.getElementById(id)?.classList.remove('active'); document.body.style.overflow=''; }
function hideLoader() {
  const loader = document.getElementById('et-loader');
  if (loader) { loader.classList.add('hidden'); document.body.classList.remove('et-loading'); }
}
