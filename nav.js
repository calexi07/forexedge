// ══════════════════════════════════════
// FOREXEDGE — Shared Navigation
// ══════════════════════════════════════
function renderNav(activePage) {
  const pages = [
    { id: 'index', label: 'Home', href: 'index.html' },
    { id: 'news', label: 'News', href: 'news.html' },
    { id: 'journal', label: 'Journal', href: 'journal.html' },
    { id: 'academy', label: 'Academy', href: 'academy.html' },
    { id: 'tools', label: 'Tools', href: 'tools.html' },
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
      <div class="nav-cta">
        <a href="#" class="btn-ghost" onclick="openModal('login');return false;">Sign In</a>
        <a href="#" class="btn-gold" onclick="openModal('register');return false;">Get Started →</a>
      </div>
      <button class="nav-burger" onclick="toggleMobileNav()" id="burger">☰</button>
    </nav>
    <div class="mobile-nav" id="mobileNav">
      ${pages.map(p => `<a href="${p.href}" class="${activePage === p.id ? 'active' : ''}">${p.label}</a>`).join('')}
      <a href="#" onclick="openModal('register');return false;" style="color:var(--gold)">Get Started →</a>
    </div>
  `;
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
}

// ══════════════════════════════════════
// AUTH MODAL
// ══════════════════════════════════════
function renderModal() {
  document.getElementById('modalMount').innerHTML = `
    <div class="modal-overlay" id="authModal">
      <div class="modal">
        <button class="modal-close" onclick="closeModal()">✕</button>
        <div class="modal-logo">Forex<span>Edge</span></div>
        <div id="loginView">
          <h2 class="modal-title">Welcome back.</h2>
          <p class="modal-sub">Sign in to your account to continue.</p>
          <div class="form-group"><label class="form-label">Email Address</label><input type="email" class="form-input" placeholder="you@example.com"></div>
          <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-input" placeholder="••••••••"></div>
          <button class="form-submit">Sign In →</button>
          <div class="form-divider"><span>or</span></div>
          <button class="btn-discord">
            <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0 37.6 37.6 0 0 0-1.8-3.7.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0c.4.3.7.6 1.1.9a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-9 .2.2 0 0 0 .1-.2c1.4-14.6-2.4-27.3-10.1-38.6a.2.2 0 0 0-.1-.1zM23.7 36.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"/></svg>
            Continue with Discord
          </button>
          <p class="modal-switch">Don't have an account? <a onclick="switchModal('register')">Create one</a></p>
        </div>
        <div id="registerView" style="display:none">
          <h2 class="modal-title">Create account.</h2>
          <p class="modal-sub">Start free — no credit card required.</p>
          <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" placeholder="Your name"></div>
          <div class="form-group"><label class="form-label">Email Address</label><input type="email" class="form-input" placeholder="you@example.com"></div>
          <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-input" placeholder="Min. 8 characters"></div>
          <button class="form-submit">Create Account →</button>
          <div class="form-divider"><span>or</span></div>
          <button class="btn-discord">
            <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0 37.6 37.6 0 0 0-1.8-3.7.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0c.4.3.7.6 1.1.9a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-9 .2.2 0 0 0 .1-.2c1.4-14.6-2.4-27.3-10.1-38.6a.2.2 0 0 0-.1-.1zM23.7 36.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"/></svg>
            Sign up with Discord
          </button>
          <p class="modal-switch">Already have an account? <a onclick="switchModal('login')">Sign in</a></p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('authModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(view) {
  document.getElementById('authModal').classList.add('active');
  switchModal(view);
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('authModal').classList.remove('active');
  document.body.style.overflow = '';
}
function switchModal(view) {
  document.getElementById('loginView').style.display = view === 'login' ? 'block' : 'none';
  document.getElementById('registerView').style.display = view === 'register' ? 'block' : 'none';
}
