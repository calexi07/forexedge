/* ══════════════════════════════════════════════════════════════════════
   EaglePips Social System — social.js
   Include AFTER supabase-js and nav.js on any page
   ════════════════════════════════════════════════════════════════════ */

const EP_SOCIAL = (() => {
  const SB_URL = 'https://vaimxhgqcdhjhdiaampa.supabase.co';
  const SB_KEY = 'sb_publishable_CebHZhFOubWHVcC-DaGV8w_LsMUCVNH';

  let _sb, _user, _session;
  let _notifCount = 0;
  let _chatPanel = null;
  let _activeChatUser = null;
  let _realtimeSubs = [];
  let _presenceTimer = null;

  // ── INIT ─────────────────────────────────────────────────────────────
  async function init() {
    try {
      _sb = getNavSB() || window.supabase.createClient(SB_URL, SB_KEY);
      const { data: { session } } = await _sb.auth.getSession();
      if (!session?.user) return;
      _session = session;
      _user = session.user;

      injectUI();
      // Show friends button now that we know user is logged in
      const tryShowBtn = (n=0) => {
        const btn = document.getElementById('epFriendsBtn');
        if (btn) { btn.style.display = 'flex'; }
        else if (n < 20) setTimeout(() => tryShowBtn(n+1), 200);
      };
      setTimeout(() => tryShowBtn(), 300);

      await Promise.all([
        loadNotifications(),
        updatePresence(true),
        ensureProfile(),
      ]);
      subscribeRealtime();
      startPresenceHeartbeat();
    } catch(e) { console.warn('[Social] init error:', e.message); }
  }

  async function ensureProfile() {
    try {
      const name = _user.user_metadata?.full_name || _user.email?.split('@')[0] || 'Trader';
      const username = name.toLowerCase().replace(/[^a-z0-9]/g,'_').slice(0,20) + '_' + _user.id.slice(0,4);
      const { error } = await _sb.from('profiles').upsert({
        id: _user.id, display_name: name, username
      }, { onConflict: 'id', ignoreDuplicates: false });
      if (error) console.warn('[Social] profile upsert:', error.message);
    } catch(e) { console.warn('[Social] ensureProfile:', e.message); }
  }

  async function updatePresence(online) {
    if (!_user) return;
    await _sb.from('user_presence').upsert({
      user_id: _user.id, online, last_seen: new Date().toISOString(), updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  }

  function startPresenceHeartbeat() {
    updatePresence(true);
    _presenceTimer = setInterval(() => updatePresence(true), 30000);
    window.addEventListener('beforeunload', () => updatePresence(false));
    document.addEventListener('visibilitychange', () => updatePresence(!document.hidden));
  }

  // ── INJECT UI ────────────────────────────────────────────────────────
  function injectUI() {
    // 1. Notification bell in nav
    injectNotifBell();
    // 2. Chat panel (hidden)
    injectChatPanel();
    // 3. CSS
    injectCSS();
    // 4. Show friends button immediately (login confirmed)
    const fb = document.getElementById('epFriendsBtn');
    if (fb) fb.style.display = 'flex';
  }

  function injectNotifBell() {
    const tryInject = (attempts = 0) => {
      const cta = document.getElementById('navCta');
      if (!cta || !cta.querySelector('.hub-link')) {
        if (attempts < 50) { setTimeout(() => tryInject(attempts + 1), 300); return; }
        return;
      }
      if (document.getElementById('epNotifBell')) return; // already injected
      const bell = document.createElement('div');
      bell.id = 'epNotifBell';
      bell.style.cssText = 'position:relative;display:inline-flex;align-items:center;cursor:pointer;margin-right:2px';
      bell.innerHTML = `
        <button id="epBellBtn" style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.2s;position:relative" onclick="EP_SOCIAL.toggleNotifDropdown()">
          🔔
          <span id="epNotifBadge" style="display:none;position:absolute;top:-3px;right:-3px;width:16px;height:16px;background:#e05c5c;border-radius:50%;font-family:'DM Mono',monospace;font-size:8px;font-weight:700;color:#fff;display:none;align-items:center;justify-content:center;border:2px solid #08090c"></span>
        </button>
        <div id="epNotifDropdown" style="display:none;position:absolute;top:calc(100%+8px);right:0;width:320px;background:#0c0e14;border:1px solid rgba(200,169,110,0.2);border-radius:8px;box-shadow:0 16px 48px rgba(0,0,0,0.6);z-index:9999;overflow:hidden">
          <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between">
            <span style="font-family:'DM Mono',monospace;font-size:10px;color:#c8a96e;letter-spacing:0.1em;text-transform:uppercase">Notifications</span>
            <button onclick="EP_SOCIAL.markAllRead()" style="background:none;border:none;font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3);cursor:pointer;transition:color 0.15s" onmouseover="this.style.color='#c8a96e'" onmouseout="this.style.color='rgba(255,255,255,0.3)'">Mark all read</button>
          </div>
          <div id="epNotifList" style="max-height:360px;overflow-y:auto"></div>
        </div>`;
      cta.insertBefore(bell, cta.firstChild);
      document.addEventListener('click', e => {
        if (!document.getElementById('epNotifBell')?.contains(e.target))
          document.getElementById('epNotifDropdown').style.display = 'none';
      });
    };
    tryInject();
  }

  function injectChatPanel() {
    const panel = document.createElement('div');
    panel.id = 'epChatSystem';
    panel.innerHTML = `
      <!-- Friends sidebar -->
      <div id="epFriendsSidebar" style="position:fixed;right:0;top:70px;bottom:0;width:260px;background:#0c0e14;border-left:1px solid rgba(255,255,255,0.07);z-index:800;transform:translateX(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column">
        <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between">
          <span style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#c8a96e">Friends</span>
          <button onclick="EP_SOCIAL.closeFriends()" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:16px;padding:0">✕</button>
        </div>
        <!-- Search -->
        <div style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05)">
          <input type="text" id="epFriendSearch" placeholder="Search users..." oninput="EP_SOCIAL.searchUsers(this.value)"
            style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:8px 12px;color:#fff;font-family:'Syne',sans-serif;font-size:12px;outline:none;box-sizing:border-box">
        </div>
        <!-- Tabs -->
        <div style="display:flex;border-bottom:1px solid rgba(255,255,255,0.07)">
          <button class="ep-ftab active" id="ftab-friends" onclick="EP_SOCIAL.showFriendsTab('friends')" style="flex:1;padding:8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.08em;text-transform:uppercase;border:none;background:none;cursor:pointer;color:#c8a96e;border-bottom:2px solid #c8a96e;transition:all 0.15s">Friends</button>
          <button class="ep-ftab" id="ftab-requests" onclick="EP_SOCIAL.showFriendsTab('requests')" style="flex:1;padding:8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.08em;text-transform:uppercase;border:none;background:none;cursor:pointer;color:rgba(255,255,255,0.3);border-bottom:2px solid transparent;transition:all 0.15s">Requests <span id="epReqBadge" style="display:none;background:#e05c5c;color:#fff;border-radius:100px;padding:1px 5px;font-size:7px"></span></button>
          <button class="ep-ftab" id="ftab-search" onclick="EP_SOCIAL.showFriendsTab('search')" style="flex:1;padding:8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.08em;text-transform:uppercase;border:none;background:none;cursor:pointer;color:rgba(255,255,255,0.3);border-bottom:2px solid transparent;transition:all 0.15s">Explore</button>
        </div>
        <div id="epFriendsList" style="flex:1;overflow-y:auto;padding:8px 0"></div>
      </div>

      <!-- Chat window -->
      <div id="epChatWindow" style="position:fixed;right:260px;bottom:0;width:320px;background:#0c0e14;border:1px solid rgba(255,255,255,0.1);border-bottom:none;border-radius:8px 8px 0 0;z-index:801;display:none;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,0.5)" >
        <div id="epChatHeader" style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:10px;cursor:pointer" onclick="EP_SOCIAL.toggleChatCollapse()">
          <div id="epChatAvatar" style="width:28px;height:28px;border-radius:50%;background:rgba(200,169,110,0.1);border:1px solid rgba(200,169,110,0.2);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11px;color:#c8a96e;flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div id="epChatName" style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
            <div id="epChatStatus" style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3)"></div>
          </div>
          <button onclick="event.stopPropagation();EP_SOCIAL.closeChat()" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:14px;padding:0">✕</button>
        </div>
        <div id="epChatMessages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:240px;max-height:360px"></div>
        <div id="epChatInput" style="padding:10px 12px;border-top:1px solid rgba(255,255,255,0.07);display:flex;gap:6px;align-items:flex-end">
          <button onclick="EP_SOCIAL.openEmojiPicker()" style="background:none;border:none;font-size:18px;cursor:pointer;padding:4px;opacity:0.6;transition:opacity 0.15s;flex-shrink:0" title="Emoji" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">😊</button>
          <label style="cursor:pointer;padding:4px;opacity:0.6;transition:opacity 0.15s;flex-shrink:0;font-size:16px" title="Upload image" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
            📎<input type="file" accept="image/*" style="display:none" onchange="EP_SOCIAL.uploadImage(this)">
          </label>
          <textarea id="epMsgInput" placeholder="Message..." rows="1" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:7px 10px;color:#fff;font-family:'Syne',sans-serif;font-size:12px;outline:none;resize:none;line-height:1.4;max-height:80px"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();EP_SOCIAL.sendMessage()}"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px'"></textarea>
          <button onclick="EP_SOCIAL.sendMessage()" style="background:#c8a96e;border:none;border-radius:4px;width:30px;height:30px;cursor:pointer;font-size:14px;flex-shrink:0;transition:background 0.15s;display:flex;align-items:center;justify-content:center" onmouseover="this.style.background='#d4b87e'" onmouseout="this.style.background='#c8a96e'">↑</button>
        </div>
        <!-- Emoji picker -->
        <div id="epEmojiPicker" style="display:none;padding:10px;border-top:1px solid rgba(255,255,255,0.07);flex-wrap:wrap;gap:4px;max-height:120px;overflow-y:auto">
          ${['😊','😂','🔥','💯','📈','📉','🎯','✅','❌','⚠️','🚀','💰','🏆','👀','🤔','💪','🙈','😎','❤️','👍','👎','🫡','🤝','💡','⚡','🦅','📊','📋','🎖'].map(e=>`<button onclick="EP_SOCIAL.insertEmoji('${e}')" style="background:none;border:none;font-size:20px;cursor:pointer;padding:3px;border-radius:3px;transition:background 0.1s" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='none'">${e}</button>`).join('')}
        </div>
      </div>

      <!-- Friends toggle button (floating) — hidden until logged in -->
      <button id="epFriendsBtn" onclick="EP_SOCIAL.toggleFriends()" title="Friends & Messages"
        style="position:fixed;bottom:80px;right:16px;width:44px;height:44px;border-radius:50%;background:#0c0e14;border:1px solid rgba(200,169,110,0.3);cursor:pointer;font-size:20px;z-index:799;transition:all 0.2s;box-shadow:0 4px 16px rgba(0,0,0,0.4);display:none;align-items:center;justify-content:center"
        onmouseover="this.style.background='rgba(200,169,110,0.12)';this.style.borderColor='#c8a96e'" onmouseout="this.style.background='#0c0e14';this.style.borderColor='rgba(200,169,110,0.3)'">
        👥
        <span id="epMsgBadge" style="display:none;position:absolute;top:-3px;right:-3px;width:16px;height:16px;background:#e05c5c;border-radius:50%;font-family:'DM Mono',monospace;font-size:8px;font-weight:700;color:#fff;align-items:center;justify-content:center;border:2px solid #08090c"></span>
      </button>`;
    document.body.appendChild(panel);
    _chatPanel = panel;
  }

  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .ep-ftab{transition:all 0.15s!important}
      .ep-ftab.active{color:#c8a96e!important;border-bottom-color:#c8a96e!important}
      .ep-friend-row{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;transition:background 0.15s}
      .ep-friend-row:hover{background:rgba(255,255,255,0.04)}
      .ep-avatar{width:32px;height:32px;border-radius:50%;background:rgba(200,169,110,0.1);border:1px solid rgba(200,169,110,0.2);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:12px;color:#c8a96e;flex-shrink:0;position:relative;overflow:hidden}
      .ep-avatar img{width:100%;height:100%;object-fit:cover}
      .ep-online-dot{position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:#4caf7d;border:2px solid #0c0e14}
      .ep-offline-dot{position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.2);border:2px solid #0c0e14}
      .ep-msg-out{align-self:flex-end;background:rgba(200,169,110,0.15);border:1px solid rgba(200,169,110,0.2);border-radius:12px 12px 2px 12px;padding:8px 12px;max-width:85%;font-size:13px;color:#fff;line-height:1.5;word-break:break-word}
      .ep-msg-in{align-self:flex-start;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px 12px 12px 2px;padding:8px 12px;max-width:85%;font-size:13px;color:#e8e6e0;line-height:1.5;word-break:break-word}
      .ep-msg-time{font-family:'DM Mono',monospace;font-size:8px;color:rgba(255,255,255,0.25);margin-top:3px;text-align:right}
      .ep-msg-img{max-width:100%;border-radius:6px;cursor:pointer;display:block;margin-top:4px}
      .ep-notif-item{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.15s;display:flex;gap:10px;align-items:flex-start}
      .ep-notif-item:hover{background:rgba(255,255,255,0.03)}
      .ep-notif-item.unread{background:rgba(200,169,110,0.05)}
      .ep-notif-dot{width:6px;height:6px;border-radius:50%;background:#c8a96e;flex-shrink:0;margin-top:5px}
      #epChatMessages::-webkit-scrollbar{width:3px}
      #epChatMessages::-webkit-scrollbar-track{background:transparent}
      #epChatMessages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
      #epFriendsList::-webkit-scrollbar{width:3px}
      #epFriendsList::-webkit-scrollbar-track{background:transparent}
      #epFriendsList::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
    `;
    document.head.appendChild(style);
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────
  async function loadNotifications() {
    const { data } = await _sb.from('notifications')
      .select('*').eq('user_id', _user.id)
      .order('created_at', { ascending: false }).limit(20);
    renderNotifications(data || []);
  }

  function renderNotifications(notifs) {
    const unread = notifs.filter(n => !n.read).length;
    _notifCount = unread;
    const badge = document.getElementById('epNotifBadge');
    if (badge) {
      badge.textContent = unread > 9 ? '9+' : unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
    const list = document.getElementById('epNotifList');
    if (!list) return;
    if (!notifs.length) {
      list.innerHTML = '<div style="text-align:center;padding:24px;font-size:12px;color:rgba(255,255,255,0.25)">No notifications yet</div>';
      return;
    }
    list.innerHTML = notifs.map(n => {
      const icons = { friend_request:'👋', friend_accepted:'🤝', message:'💬', achievement:'🎖' };
      const icon = icons[n.type] || '🔔';
      const time = timeAgo(n.created_at);
      return `<div class="ep-notif-item ${n.read?'':'unread'}" onclick="EP_SOCIAL.handleNotifClick('${n.id}','${n.type}','${n.link||''}','${n.from_user_id||''}','${encodeURIComponent(JSON.stringify(n.data||{}))}')">
        ${!n.read?'<div class="ep-notif-dot"></div>':'<div style="width:6px;flex-shrink:0"></div>'}
        <div style="font-size:18px;flex-shrink:0">${icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:2px">${n.title}</div>
          ${n.body?`<div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${n.body}</div>`:''}
          <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.25);margin-top:3px">${time}</div>
        </div>
      </div>`;
    }).join('');
  }

  async function handleNotifClick(notifId, type, link, fromUserId, dataStr) {
    await _sb.from('notifications').update({ read: true }).eq('id', notifId);
    document.getElementById('epNotifDropdown').style.display = 'none';

    if (type === 'friend_request' && fromUserId) {
      toggleFriends();
      showFriendsTab('requests');
    } else if (type === 'message' && fromUserId) {
      const { data: profile } = await _sb.from('profiles').select('*').eq('id', fromUserId).single();
      if (profile) openChat(profile);
    } else if (link) {
      window.location.href = link;
    }
    loadNotifications();
  }

  async function markAllRead() {
    await _sb.from('notifications').update({ read: true }).eq('user_id', _user.id).eq('read', false);
    loadNotifications();
  }

  function toggleNotifDropdown() {
    const dd = document.getElementById('epNotifDropdown');
    const isOpen = dd.style.display !== 'none';
    dd.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) loadNotifications();
  }

  // ── FRIENDS SIDEBAR ───────────────────────────────────────────────────
  let _friendsOpen = false;
  let _currentTab = 'friends';
  let _friends = [], _requests = [], _searchResults = [];

  function toggleFriends() {
    _friendsOpen = !_friendsOpen;
    const sidebar = document.getElementById('epFriendsSidebar');
    sidebar.style.transform = _friendsOpen ? 'translateX(0)' : 'translateX(100%)';
    if (_friendsOpen) {
      loadFriends();
      loadRequests();
    }
  }

  function closeFriends() {
    _friendsOpen = false;
    document.getElementById('epFriendsSidebar').style.transform = 'translateX(100%)';
  }

  function showFriendsTab(tab) {
    _currentTab = tab;
    document.querySelectorAll('.ep-ftab').forEach(b => {
      b.classList.remove('active');
      b.style.color = 'rgba(255,255,255,0.3)';
      b.style.borderBottomColor = 'transparent';
    });
    const active = document.getElementById('ftab-' + tab);
    if (active) { active.classList.add('active'); active.style.color = '#c8a96e'; active.style.borderBottomColor = '#c8a96e'; }
    if (tab === 'search') {
      if (!_allProfiles.length && !_profilesLoading) {
        loadAllProfiles().then(() => {
          _searchResults = _allProfiles;
          renderFriendsList();
        });
      } else {
        if (!_searchResults.length) _searchResults = _allProfiles;
        renderFriendsList();
      }
    } else {
      renderFriendsList();
    }
  }

  async function loadFriends() {
    // Get friendship IDs first, then load profiles separately
    const [sentRes, recvRes] = await Promise.all([
      _sb.from('friendships').select('id,addressee_id').eq('requester_id', _user.id).eq('status','accepted'),
      _sb.from('friendships').select('id,requester_id').eq('addressee_id', _user.id).eq('status','accepted')
    ]);
    const friendIds = [
      ...(sentRes.data||[]).map(f => f.addressee_id),
      ...(recvRes.data||[]).map(f => f.requester_id)
    ].filter(Boolean);

    // Load profiles + presence for all friends
    let friendProfiles = [];
    let presence = {};
    if (friendIds.length) {
      const [profRes, presRes] = await Promise.all([
        _sb.from('profiles').select('id,display_name,username,avatar_url').in('id', friendIds),
        _sb.from('user_presence').select('user_id,online,last_seen').in('user_id', friendIds)
      ]);
      friendProfiles = profRes.data || [];
      (presRes.data||[]).forEach(pr => presence[pr.user_id] = pr);
    }

    _friends = friendProfiles.map(f => ({
      ...f,
      online: presence[f.id]?.online || false,
      last_seen: presence[f.id]?.last_seen
    }));

    _friends.sort((a,b) => (b.online?1:0) - (a.online?1:0));

    // Unread messages count
    const { count } = await _sb.from('messages').select('id', { count:'exact' })
      .eq('receiver_id', _user.id).eq('read', false);
    const msgBadge = document.getElementById('epMsgBadge');
    if (msgBadge) { msgBadge.textContent = count; msgBadge.style.display = count > 0 ? 'flex' : 'none'; }

    if (_currentTab === 'friends') renderFriendsList();
  }

  async function loadRequests() {
    const { data: reqs } = await _sb.from('friendships')
      .select('id,requester_id,created_at')
      .eq('addressee_id', _user.id).eq('status', 'pending');
    if (!reqs?.length) { _requests = []; return; }
    // Load requester profiles separately
    const reqIds = reqs.map(r => r.requester_id);
    const { data: profiles } = await _sb.from('profiles').select('id,display_name,username,avatar_url').in('id', reqIds);
    const profileMap = {};
    (profiles||[]).forEach(p => profileMap[p.id] = p);
    _requests = reqs.map(r => ({ ...r, requester: profileMap[r.requester_id] || { id: r.requester_id, display_name: 'Trader' } }));
    const badge = document.getElementById('epReqBadge');
    if (badge) { badge.textContent = _requests.length; badge.style.display = _requests.length ? 'inline' : 'none'; }
    if (_currentTab === 'requests') renderFriendsList();
  }

  function renderFriendsList() {
    const list = document.getElementById('epFriendsList');
    if (!list) return;

    if (_currentTab === 'friends') {
      if (!_friends.length) {
        list.innerHTML = '<div style="text-align:center;padding:24px;font-size:12px;color:rgba(255,255,255,0.25)">No friends yet. Search for traders to connect!</div>';
        return;
      }
      list.innerHTML = _friends.map(f => avatarRow(f, f.online, () =>
        `<button onclick="EP_SOCIAL.openChatById('${f.id}')" style="background:rgba(200,169,110,0.1);border:1px solid rgba(200,169,110,0.2);color:#c8a96e;padding:3px 8px;border-radius:3px;font-family:'DM Mono',monospace;font-size:9px;cursor:pointer">Chat</button>`
      )).join('');
    } else if (_currentTab === 'requests') {
      if (!_requests.length) {
        list.innerHTML = '<div style="text-align:center;padding:24px;font-size:12px;color:rgba(255,255,255,0.25)">No pending requests</div>';
        return;
      }
      list.innerHTML = _requests.map(r => {
        const u = r.requester;
        return `<div class="ep-friend-row">
          ${avatarHtml(u, false)}
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.display_name||u.username||'Trader'}</div>
            <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3)">wants to be friends</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button onclick="EP_SOCIAL.respondFriend('${r.id}','accepted')" style="background:rgba(76,175,125,0.15);border:1px solid rgba(76,175,125,0.3);color:#4caf7d;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer">✓</button>
            <button onclick="EP_SOCIAL.respondFriend('${r.id}','blocked')" style="background:rgba(224,92,92,0.1);border:1px solid rgba(224,92,92,0.2);color:#e05c5c;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer">✕</button>
          </div>
        </div>`;
      }).join('');
    } else if (_currentTab === 'search') {
      if (!_searchResults.length) {
        list.innerHTML = '<div style="text-align:center;padding:24px;font-size:12px;color:rgba(255,255,255,0.25)">Type to search, or wait...</div>';
        return;
      }
      list.innerHTML = _searchResults.map(u => {
        const isFriend = _friends.some(f => f.id === u.id);
        const isPending = _requests.some(r => r.requester_id === u.id) || u._pendingRequest;
        const isMe = u.id === _user.id;
        const btn = isMe ? '' : isFriend
          ? `<span style="font-family:'DM Mono',monospace;font-size:9px;color:#4caf7d">✓ Friends</span>`
          : isPending
          ? `<span style="font-family:'DM Mono',monospace;font-size:9px;color:#c8a96e">⏳ Pending</span>`
          : `<button onclick="EP_SOCIAL.sendFriendRequest('${u.id}','${(u.display_name||'').replace(/'/g,'')}')" style="background:rgba(200,169,110,0.1);border:1px solid rgba(200,169,110,0.25);color:#c8a96e;padding:4px 10px;border-radius:3px;font-family:'DM Mono',monospace;font-size:9px;cursor:pointer">+ Add</button>`;
        return `<div class="ep-friend-row">
          ${avatarHtml(u, false)}
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.display_name||u.username||'Trader'}</div>
            <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.3)">@${u.username||''}</div>
          </div>
          ${btn}
        </div>`;
      }).join('');
    }
  }

  function avatarHtml(user, online) {
    const name = user?.display_name || user?.username || 'T';
    const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    const av = user?.avatar_url ? `<img src="${user.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : initials;
    const dot = `<span class="${online?'ep-online-dot':'ep-offline-dot'}"></span>`;
    return `<div class="ep-avatar">${av}${dot}</div>`;
  }

  function avatarRow(user, online, actionsFn) {
    return `<div class="ep-friend-row" onclick="EP_SOCIAL.openChatById('${user.id}')">
      ${avatarHtml(user, online)}
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.display_name||user.username||'Trader'}</div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:${online?'#4caf7d':'rgba(255,255,255,0.3)'}">${online?'● Online':('Last seen '+timeAgo(user.last_seen))}</div>
      </div>
      ${actionsFn ? actionsFn() : ''}
    </div>`;
  }

  let _searchTimer;
  let _allProfiles = [];

  let _profilesLoading = false;
  async function loadAllProfiles() {
    if (_profilesLoading || _allProfiles.length > 0) return; // prevent loops
    _profilesLoading = true;
    try {
      // Use select without neq to avoid RLS issues, filter client-side
      const { data, error } = await _sb.from('profiles')
        .select('id,display_name,username,avatar_url')
        .limit(100);
      if (error) { console.warn('[Social] profiles error:', error.message); _allProfiles = []; return; }
      // Filter out self client-side
      _allProfiles = (data || []).filter(u => u.id !== _user.id);
    } finally {
      _profilesLoading = false;
    }
  }

  async function searchUsers(q) {
    clearTimeout(_searchTimer);
    showFriendsTab('search');
    const query = q.trim().toLowerCase();
    if (!query) {
      if (!_allProfiles.length && !_profilesLoading) {
        loadAllProfiles().then(() => { _searchResults = _allProfiles; renderFriendsList(); });
      } else {
        _searchResults = _allProfiles;
        renderFriendsList();
      }
      return;
    }
    _searchTimer = setTimeout(() => {
      // Client-side filter (faster, works even if ilike fails)
      _searchResults = _allProfiles.filter(u =>
        (u.display_name||'').toLowerCase().includes(query) ||
        (u.username||'').toLowerCase().includes(query)
      );
      // Also try DB search in case profile wasn't in initial load
      _sb.from('profiles')
        .select('id,display_name,username,avatar_url')
        .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
        .neq('id', _user.id)
        .limit(15)
        .then(({ data }) => {
          if (data?.length) {
            // Merge results deduped
            const ids = new Set(_searchResults.map(u => u.id));
            _searchResults = [..._searchResults, ...data.filter(u => !ids.has(u.id))];
            renderFriendsList();
          }
        });
      renderFriendsList();
    }, 200);
  }

  async function sendFriendRequest(toUserId, toName) {
    // Check if friendship already exists
    const { data: existing } = await _sb.from('friendships')
      .select('id,status')
      .or(`and(requester_id.eq.${_user.id},addressee_id.eq.${toUserId}),and(requester_id.eq.${toUserId},addressee_id.eq.${_user.id})`)
      .single();
    
    if (existing) {
      if (existing.status === 'accepted') { alert('You are already friends!'); return; }
      if (existing.status === 'pending') { alert('Friend request already sent or pending.'); return; }
    }

    const { error } = await _sb.from('friendships').insert({ requester_id: _user.id, addressee_id: toUserId });
    if (error?.code === '23505' || error?.code === '409') { alert('Friend request already exists.'); return; }
    if (error) { alert('Error: ' + error.message); return; }
    // Send notification
    const myName = _user.user_metadata?.full_name || _user.email?.split('@')[0] || 'Someone';
    await _sb.from('notifications').insert({
      user_id: toUserId, type: 'friend_request',
      title: `${myName} sent you a friend request`,
      body: 'Click to accept or decline',
      from_user_id: _user.id, data: { from_name: myName }
    });
    renderFriendsList();
    alert(`Friend request sent to ${toName}!`);
  }

  async function respondFriend(friendshipId, status) {
    await _sb.from('friendships').update({ status, updated_at: new Date().toISOString() }).eq('id', friendshipId);
    if (status === 'accepted') {
      const req = _requests.find(r => r.id === friendshipId);
      if (req) {
        const myName = _user.user_metadata?.full_name || _user.email?.split('@')[0] || 'Someone';
        await _sb.from('notifications').insert({
          user_id: req.requester_id, type: 'friend_accepted',
          title: `${myName} accepted your friend request`,
          body: 'You are now friends! Start a conversation.',
          from_user_id: _user.id
        });
      }
    }
    await loadFriends();
    await loadRequests();
  }

  // ── CHAT ──────────────────────────────────────────────────────────────
  let _chatCollapsed = false;
  let _chatSub = null;

  async function openChatById(userId) {
    const { data: profile } = await _sb.from('profiles').select('*').eq('id', userId).single();
    if (profile) openChat(profile);
  }

  async function openChat(profile) {
    _activeChatUser = profile;
    const win = document.getElementById('epChatWindow');
    win.style.display = 'flex';
    _chatCollapsed = false;
    document.getElementById('epChatMessages').style.display = 'flex';
    document.getElementById('epChatInput').style.display = 'flex';
    document.getElementById('epEmojiPicker').style.display = 'none';

    const initials = (profile.display_name||'T').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    document.getElementById('epChatAvatar').innerHTML = profile.avatar_url
      ? `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
      : initials;
    document.getElementById('epChatName').textContent = profile.display_name || profile.username || 'Trader';

    // Online status
    const { data: pres } = await _sb.from('user_presence').select('online,last_seen').eq('user_id', profile.id).single();
    document.getElementById('epChatStatus').textContent = pres?.online ? '● Online' : pres?.last_seen ? 'Last seen ' + timeAgo(pres.last_seen) : 'Offline';

    await loadMessages();
    subscribeChatRealtime();

    // Mark messages as read
    const convId = convKey(_user.id, profile.id);
    await _sb.from('messages').update({ read: true }).eq('conversation_id', convId).eq('receiver_id', _user.id).eq('read', false);
  }

  function convKey(a, b) { return [a,b].sort().join('_'); }

  async function loadMessages() {
    if (!_activeChatUser) return;
    const convId = convKey(_user.id, _activeChatUser.id);
    const { data } = await _sb.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(50);
    renderMessages(data || []);
  }

  function renderMessages(msgs) {
    const el = document.getElementById('epChatMessages');
    if (!el) return;
    el.innerHTML = msgs.map(m => {
      const isOut = m.sender_id === _user.id;
      const time = new Date(m.created_at).toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});
      const content = m.image_url
        ? `<img src="${m.image_url}" class="ep-msg-img" onclick="window.open(this.src)">`
        : (m.content || '');
      return `<div class="${isOut?'ep-msg-out':'ep-msg-in'}">
        ${content}
        <div class="ep-msg-time">${time}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function subscribeChatRealtime() {
    if (_chatSub) _sb.removeChannel(_chatSub);
    if (!_activeChatUser) return;
    const convId = convKey(_user.id, _activeChatUser.id);
    try {
      _chatSub = _sb.channel('ep-chat-' + convId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` }, () => loadMessages())
        .subscribe();
    } catch(e) {
      // Poll every 3s as fallback
      _chatSub = setInterval(() => loadMessages(), 3000);
    }
  }

  async function sendMessage() {
    const inp = document.getElementById('epMsgInput');
    const content = inp.value.trim();
    if (!content || !_activeChatUser) return;
    inp.value = ''; inp.style.height = 'auto';
    const { error } = await _sb.from('messages').insert({
      conversation_id: convKey(_user.id, _activeChatUser.id),
      sender_id: _user.id, receiver_id: _activeChatUser.id,
      content
    });
    if (error) { console.warn('Send error:', error); return; }
    // Notify receiver
    const myName = _user.user_metadata?.full_name || _user.email?.split('@')[0] || 'Someone';
    await _sb.from('notifications').upsert({
      user_id: _activeChatUser.id, type: 'message',
      title: `${myName}`, body: content.slice(0, 80),
      from_user_id: _user.id, read: false,
      created_at: new Date().toISOString()
    });
  }

  async function uploadImage(input) {
    const file = input.files[0];
    if (!file || !_activeChatUser) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large — max 5MB'); return; }
    const ext = file.name.split('.').pop();
    const path = `chat/${_user.id}/${Date.now()}.${ext}`;
    const { data, error } = await _sb.storage.from('EaglePips').upload(path, file, { upsert: true });
    if (error) { alert('Upload error: ' + error.message); return; }
    const { data: { publicUrl } } = _sb.storage.from('EaglePips').getPublicUrl(path);
    await _sb.from('messages').insert({
      conversation_id: convKey(_user.id, _activeChatUser.id),
      sender_id: _user.id, receiver_id: _activeChatUser.id,
      image_url: publicUrl, content: null
    });
    input.value = '';
  }

  function toggleChatCollapse() {
    _chatCollapsed = !_chatCollapsed;
    document.getElementById('epChatMessages').style.display = _chatCollapsed ? 'none' : 'flex';
    document.getElementById('epChatInput').style.display = _chatCollapsed ? 'none' : 'flex';
    document.getElementById('epEmojiPicker').style.display = 'none';
  }

  function closeChat() {
    _activeChatUser = null;
    document.getElementById('epChatWindow').style.display = 'none';
    if (_chatSub) { _sb.removeChannel(_chatSub); _chatSub = null; }
  }

  function openEmojiPicker() {
    const ep = document.getElementById('epEmojiPicker');
    ep.style.display = ep.style.display === 'none' ? 'flex' : 'none';
  }

  function insertEmoji(e) {
    const inp = document.getElementById('epMsgInput');
    inp.value += e; inp.focus();
    document.getElementById('epEmojiPicker').style.display = 'none';
  }

  // ── REALTIME (notifications) ──────────────────────────────────────────
  function subscribeRealtime() {
    try {
      _sb.channel('ep-notifs-' + _user.id)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${_user.id}` }, () => loadNotifications())
        .subscribe((status, err) => {
          if (err) console.warn('[Social] Realtime not available - polling instead');
        });
      // Fallback: poll notifications every 30s if WebSocket fails
      setInterval(() => loadNotifications(), 30000);
    } catch(e) {
      console.warn('[Social] Realtime disabled:', e.message);
      setInterval(() => loadNotifications(), 30000);
    }
  }

  // ── UTILS ─────────────────────────────────────────────────────────────
  function timeAgo(ts) {
    if (!ts) return 'a while ago';
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    return Math.floor(diff/86400) + 'd ago';
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────
  return {
    init, toggleFriends, closeFriends, showFriendsTab,
    searchUsers, sendFriendRequest, respondFriend,
    openChat, openChatById, sendMessage, uploadImage,
    toggleChatCollapse, closeChat, openEmojiPicker, insertEmoji,
    toggleNotifDropdown, markAllRead, handleNotifClick,
  };
})();

// Init is called explicitly from supabase onload on each page
// This prevents timing issues with getNavSB() not being ready
