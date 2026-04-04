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
      <div class="nav-cta" id="navCta">
        <a href="auth.html" class="btn-ghost">Sign In</a>
        <a href="auth.html?tab=register" class="btn-gold">Get Started →</a>
      </div>
      <button class="nav-burger" onclick="toggleMobileNav()" id="burger">☰</button>
    </nav>
    <div class="mobile-nav" id="mobileNav">
      ${pages.map(p => `<a href="${p.href}" class="${activePage === p.id ? 'active' : ''}">${p.label}</a>`).join('')}
      <a href="auth.html?tab=register" style="color:var(--gold)">Get Started →</a>
    </div>
  `;
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
}
