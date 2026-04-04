// ══════════════════════════════════════
// FOREXEDGE — Supabase Config & Helpers
// ══════════════════════════════════════
const SUPABASE_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

let _sbClient = null;

async function getSB() {
  if (_sbClient) return _sbClient;
  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sbClient;
}

// ── AUTH ──
async function authSignUp(email, password, fullName) {
  const sb = await getSB();
  return await sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
}

async function authSignIn(email, password) {
  const sb = await getSB();
  return await sb.auth.signInWithPassword({ email, password });
}

async function authSignOut() {
  const sb = await getSB();
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

async function authGetUser() {
  const sb = await getSB();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function authResetPassword(email) {
  const sb = await getSB();
  return await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset.html'
  });
}

// ── TRADES DB ──
async function dbGetTrades() {
  const sb = await getSB();
  return await sb.from('trades').select('*').order('created_at', { ascending: false });
}

async function dbAddTrade(trade) {
  const sb = await getSB();
  const user = await authGetUser();
  if (!user) return { error: { message: 'Not authenticated' } };
  return await sb.from('trades').insert([{ ...trade, user_id: user.id }]).select();
}

async function dbDeleteTrade(id) {
  const sb = await getSB();
  return await sb.from('trades').delete().eq('id', id);
}

async function dbUpdateTrade(id, updates) {
  const sb = await getSB();
  return await sb.from('trades').update(updates).eq('id', id).select();
}

// ── UI HELPERS ──
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  const color = type === 'success' ? '#4caf7d' : type === 'error' ? '#e05c5c' : '#c9a84c';
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;padding:12px 20px;background:${color};color:#fff;font-family:'DM Mono',monospace;font-size:12px;border-radius:3px;letter-spacing:0.05em;box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:fadeUp 0.3s ease;max-width:320px`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.style.opacity = '0', 2700);
  setTimeout(() => el.remove(), 3000);
}

function btnLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn._orig = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin 0.7s linear infinite;margin-right:6px;vertical-align:middle"></span>Loading...';
  } else {
    btn.disabled = false;
    btn.textContent = btn._orig || btn.textContent;
  }
}

// ── AUTH STATE WATCHER ──
async function onAuthChange(callback) {
  const sb = await getSB();
  sb.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ── UPDATE NAV FOR AUTH STATE ──
async function updateNavAuth() {
  const user = await authGetUser();
  const ctaEl = document.querySelector('.nav-cta');
  if (!ctaEl) return;
  if (user) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account';
    ctaEl.innerHTML = `
      <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)">${user.email}</span>
      <a href="journal.html" class="btn-ghost">My Journal</a>
      <button class="btn-gold" onclick="authSignOut()">Sign Out</button>
    `;
  }
}
