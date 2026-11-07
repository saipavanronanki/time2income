(function () {
  'use strict';

  const CHAT_STATUSES = ['accepted', 'confirmed', 'in_progress', 'completion_pending', 'disputed', 'completed', 'cancelled'];
  const WRITABLE_STATUSES = ['accepted', 'confirmed', 'in_progress', 'completion_pending', 'disputed'];
  const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024;
  const BUCKET = 'booking-chat-files';
  const AVATAR_CLASSES = ['', 'c1', 'c2', 'c3', 'c4'];
  const isLocalHost = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const demoMode = isLocalHost && new URLSearchParams(location.search).has('demo');

  const $ = id => document.getElementById(id);
  const db = window.supabaseClient;
  const state = {
    user: null, conversations: [], filter: 'all', query: '', activeId: null,
    writable: false, blocked: false, files: [], chatTimer: null, inboxTimer: null,
    summaryAvailable: true, archived: new Set(), attachments: {}, bookingEvents: []
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  function toast(message) {
    const el = $('msgToast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  }
  function initial(name) { return (String(name || '?').trim()[0] || '?').toUpperCase(); }
  function avatarClass(id) {
    let sum = 0;
    for (const ch of String(id)) sum += ch.charCodeAt(0);
    return AVATAR_CLASSES[sum % AVATAR_CLASSES.length];
  }
  function fmtSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = bytes, i = 0;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
    return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
  }
  function sameDay(a, b) { return a.toDateString() === b.toDateString(); }
  function listTime(iso) {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    if (sameDay(d, now)) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay(d, y)) return 'Yesterday';
    if (now - d < 6 * 864e5) return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  function dayLabel(d) {
    const now = new Date(), y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay(d, now)) return 'Today';
    if (sameDay(d, y)) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function statusLabel(status) {
    return String(status || '').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
  }
  function money(amount, currency) {
    if (amount == null) return '';
    try { return new Intl.NumberFormat([], { style: 'currency', currency: currency || 'INR' }).format(amount); }
    catch (e) { return `${amount} ${currency || ''}`.trim(); }
  }

  const archiveKey = () => `time2income_archived_chats_${state.user?.id}`;
  function loadArchived() {
    try { state.archived = new Set(JSON.parse(localStorage.getItem(archiveKey()) || '[]')); }
    catch (e) { state.archived = new Set(); }
  }
  function saveArchived() {
    try { localStorage.setItem(archiveKey(), JSON.stringify([...state.archived])); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- data ---------- */
  function demoConversations() {
    const now = Date.now();
    const mk = (id, name, task, last, mins, unread, status, mine) => ({
      id, otherId: id, otherName: name, title: task, status, price: 2500, currency: 'INR',
      createdAt: new Date(now - 864e5 * 3).toISOString(),
      lastBody: last, lastAt: new Date(now - mins * 6e4).toISOString(), lastMine: mine, unread
    });
    return [
      mk('d1', 'Rahul Sharma', 'Website Design', 'I have completed the first draft.', 20, 2, 'in_progress', false),
      mk('d2', 'Sarah Johnson', 'Graphic Design', "Thank you! Let's discuss the details.", 60 * 20, 0, 'accepted', false),
      mk('d3', 'Alex Morgan', 'Home Repair', 'Can you share your availability?', 60 * 22, 1, 'confirmed', false),
      mk('d4', 'David Wilson', 'Data Entry', 'The documents are attached.', 60 * 24 * 4, 0, 'completed', true)
    ];
  }
  const demoMessages = {
    d1: [
      ['o', 'Hi! I saw your website design task. I can help you with it.', 1500],
      ['m', 'Great! Can you share your previous work?', 1490],
      ['o', 'Sure, I have attached my portfolio.', 1480, { name: 'Portfolio.pdf', size: 2516582 }],
      ['m', "Thanks! I'll review it and get back to you.", 1470],
      ['o', 'I have completed the first draft.', 20]
    ]
  };

  async function loadConversations() {
    if (demoMode) {
      state.user = { id: 'me' };
      loadArchived();
      state.conversations = demoConversations();
      return;
    }
    const uid = state.user.id;
    const { data: bookings, error } = await db.from('bookings')
      .select('id, title, status, agreed_price, currency_code, created_at, customer_id, worker_id')
      .or(`customer_id.eq.${uid},worker_id.eq.${uid}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (bookings || []).filter(b => CHAT_STATUSES.includes(b.status));
    const otherIds = [...new Set(rows.map(b => b.customer_id === uid ? b.worker_id : b.customer_id))];
    let names = {};
    if (otherIds.length) {
      const { data: people } = await db.from('profiles').select('id, display_name').in('id', otherIds);
      names = Object.fromEntries((people || []).map(p => [p.id, p.display_name]));
    }

    let summary = {};
    if (state.summaryAvailable) {
      const { data, error: summaryError } = await db.rpc('get_my_chat_summary');
      if (summaryError) state.summaryAvailable = false;
      else summary = Object.fromEntries((data || []).map(r => [r.booking_id, r]));
    }
    if (!state.summaryAvailable && rows.length) {
      // Fallback until supabase/chat-unread.sql is applied: last message only, no unread counts.
      const { data: msgs } = await db.from('booking_messages')
        .select('booking_id, sender_id, body, created_at')
        .in('booking_id', rows.map(b => b.id))
        .order('created_at', { ascending: false }).limit(500);
      (msgs || []).forEach(m => {
        if (!summary[m.booking_id]) summary[m.booking_id] = {
          booking_id: m.booking_id, last_body: m.body, last_at: m.created_at, last_sender_id: m.sender_id, unread_count: 0
        };
      });
    }

    state.conversations = rows.map(b => {
      const otherId = b.customer_id === uid ? b.worker_id : b.customer_id;
      const s = summary[b.id] || {};
      return {
        id: b.id, otherId, otherName: names[otherId] || (b.customer_id === uid ? 'Provider' : 'Customer'),
        title: b.title, status: b.status, price: b.agreed_price, currency: b.currency_code, createdAt: b.created_at,
        lastBody: s.last_body || '', lastAt: s.last_at || null, lastMine: s.last_sender_id === uid,
        unread: Number(s.unread_count) || 0
      };
    }).sort((a, b) => (Date.parse(b.lastAt) || 0) - (Date.parse(a.lastAt) || 0) ||
      Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  /* ---------- inbox ---------- */
  function visibleConversations() {
    const q = state.query.trim().toLowerCase();
    return state.conversations.filter(c => {
      const archived = state.archived.has(c.id);
      if (state.filter === 'archived') { if (!archived) return false; }
      else if (archived) return false;
      if (state.filter === 'unread' && !c.unread) return false;
      if (state.filter === 'active' && !WRITABLE_STATUSES.includes(c.status)) return false;
      if (!q) return true;
      return [c.otherName, c.title, c.lastBody].some(v => String(v || '').toLowerCase().includes(q));
    });
  }
  function renderInbox() {
    const list = $('msgList');
    const items = visibleConversations();
    if (!items.length) {
      list.innerHTML = `<p class="msg-state">${state.conversations.length
        ? 'No conversations match.'
        : 'No conversations yet. Chats open once a booking is accepted.'}</p>`;
      return;
    }
    list.innerHTML = items.map(c => `
      <button type="button" class="msg-item${c.unread ? ' is-unread' : ''}${c.id === state.activeId ? ' is-selected' : ''}" data-id="${esc(c.id)}" role="listitem">
        <span class="msg-avatar ${avatarClass(c.otherId)}">${esc(initial(c.otherName))}</span>
        <span class="msg-item-main">
          <span class="msg-item-top"><strong>${esc(c.otherName)}</strong><time>${esc(listTime(c.lastAt))}</time></span>
          <span class="msg-item-task">${esc(c.title)}</span>
          <span class="msg-item-last"><span>${c.lastBody ? `${c.lastMine ? 'You: ' : ''}${esc(c.lastBody)}` : 'No messages yet'}</span>${c.unread ? `<b class="msg-badge" aria-label="${c.unread} unread">${c.unread}</b>` : ''}</span>
        </span>
      </button>`).join('');
  }

  /* ---------- chat ---------- */
  function setView(view) { $('msgApp').dataset.view = view; }
  function activeConversation() { return state.conversations.find(c => c.id === state.activeId); }

  async function openConversation(id) {
    const c = state.conversations.find(x => x.id === id);
    if (!c) return;
    stopChatTimer();
    state.activeId = id;
    state.files = [];
    renderFiles();
    state.writable = WRITABLE_STATUSES.includes(c.status);
    state.blocked = false;
    state.attachments = {};
    setView('chat');
    $('msgChatEmpty').hidden = true;
    $('msgChatBody').hidden = false;
    $('msgChatName').textContent = c.otherName;
    $('msgChatAvatar').textContent = initial(c.otherName);
    $('msgChatAvatar').className = `msg-avatar ${avatarClass(c.otherId)}`;
    $('msgChatStatus').textContent = state.writable ? 'Task conversation' : 'Read only';
    $('msgTaskCard').innerHTML = `<div class="row"><strong>${esc(c.title)}</strong><span class="msg-pill">${esc(statusLabel(c.status))}</span></div><small>Booking ID: ${esc(String(c.id).slice(0, 8).toUpperCase())}${c.price != null ? ` · ${esc(money(c.price, c.currency))}` : ''}</small>`;
    fillDetails(c);
    $('msgThread').innerHTML = '<p class="msg-state">Loading…</p>';
    renderInbox();
    applyComposerState();

    if (!demoMode) {
      const { data, error } = await db.rpc('get_booking_chat_state', { p_booking_id: id });
      if (!error) state.blocked = Boolean(data);
      applyComposerState();
    }
    try { await loadMessages(); } catch (e) { toast('Unable to load messages.'); }
    if (state.activeId !== id) return;
    markRead(id);
    state.chatTimer = setInterval(() => {
      loadMessages().then(() => markRead(state.activeId)).catch(() => {});
    }, 5000);
  }
  function stopChatTimer() { clearInterval(state.chatTimer); state.chatTimer = null; }
  function applyComposerState() {
    const off = !state.writable || state.blocked;
    $('msgInput').disabled = off;
    $('msgSend').disabled = off;
    $('msgInput').placeholder = state.blocked ? 'This chat is blocked.' : state.writable ? 'Write a message...' : 'This chat is read only.';
    $('msgBlockBtn').disabled = off;
  }

  async function loadMessages() {
    const id = state.activeId;
    if (!id) return;
    let messages;
    if (demoMode) {
      state.bookingEvents = [];
      messages = (demoMessages[id] || []).map((m, i) => ({
        id: `${id}-${i}`, sender_id: m[0] === 'm' ? 'me' : 'other', body: m[1],
        created_at: new Date(Date.now() - m[2] * 6e4).toISOString(), demoFile: m[3] || null
      }));
    } else {
      const { data, error } = await db.from('booking_messages')
        .select('id, sender_id, body, created_at, attachment_id, message_type')
        .eq('booking_id', id).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      messages = (data || []).reverse();
      // Transaction and booking lifecycle events are stored separately from user-authored messages.
      const { data: eventRows, error: eventError } = await db.from('booking_chat_events')
        .select('id, event_type, title, detail, created_at, metadata')
        .eq('booking_id', id).order('created_at', { ascending: true }).limit(100);
      state.bookingEvents = eventError ? [] : (eventRows || []);
      const ids = [...new Set(messages.map(m => m.attachment_id).filter(Boolean))];
      if (ids.length) {
        const { data: rows } = await db.from('chat_attachments')
          .select('id, object_key, file_name, mime_type, size_bytes').in('id', ids);
        const previews = await Promise.all((rows || []).map(async a => {
          if (!String(a.mime_type || '').startsWith('image/')) return [a.id, a];
          const { data: url } = await db.storage.from(BUCKET).createSignedUrl(a.object_key, 3600);
          return [a.id, { ...a, preview: url?.signedUrl || '' }];
        }));
        previews.forEach(([k, v]) => { state.attachments[k] = v; });
      }
    }
    if (id !== state.activeId) return;

    const thread = $('msgThread');
    const nearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 80;
    let lastDay = '';
    const timeline = [
      ...messages.map(m => ({ kind: 'message', at: m.created_at, row: m })),
      ...(state.bookingEvents || []).map(ev => ({ kind: 'event', at: ev.created_at, row: ev }))
    ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    thread.innerHTML = timeline.length ? timeline.map(item => {
      const d = new Date(item.at);
      const label = dayLabel(d);
      const sep = label !== lastDay ? `<span class="msg-day">${esc(label)}</span>` : '';
      lastDay = label;
      if (item.kind === 'event') {
        const ev = item.row;
        return `${sep}<div class="msg-system-event"><span class="msg-system-event-icon">✓</span><span><strong>${esc(ev.title || 'Booking update')}</strong>${ev.detail ? `<small>${esc(ev.detail)}</small>` : ''}<time>${esc(d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }))}</time></span></div>`;
      }
      const m = item.row;
      const mine = m.sender_id === state.user.id;
      const a = m.attachment_id ? state.attachments[m.attachment_id] : null;
      const file = a
        ? `<button type="button" class="msg-file" data-attachment="${esc(a.id)}">${a.preview ? `<img src="${esc(a.preview)}" alt="">` : '<span aria-hidden="true">&#124996;</span>'}<span><strong>${esc(a.file_name)}</strong><small>${esc(fmtSize(a.size_bytes))}</small></span></button>`
        : m.demoFile ? `<div class="msg-file"><span aria-hidden="true">&#124996;</span><span><strong>${esc(m.demoFile.name)}</strong><small>${esc(fmtSize(m.demoFile.size))}</small></span></div>` : '';
      const showBody = m.body && !(a && /^Shared file/.test(m.body) || a && m.body === 'Shared a file.');
      return `${sep}<div class="msg-bubble${mine ? ' is-mine' : ''}">${showBody ? `<p>${esc(m.body)}</p>` : ''}${file}<time>${esc(d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}</time></div>`;
    }).join('') : '<p class="msg-state">No messages yet. Say hello!</p>';
    if (nearBottom || !thread.dataset.loaded) thread.scrollTop = thread.scrollHeight;
    thread.dataset.loaded = '1';
    renderSharedFiles();
  }

  function renderSharedFiles() {
    const files = Object.values(state.attachments);
    $('msgDetFiles').innerHTML = files.length
      ? files.map(a => `<button type="button" data-attachment="${esc(a.id)}" title="${esc(a.file_name)}">${esc(a.file_name)}</button>`).join('')
      : '<p>No shared files yet.</p>';
  }
  function fillDetails(c) {
    $('msgDetAvatar').textContent = initial(c.otherName);
    $('msgDetAvatar').className = `msg-avatar ${avatarClass(c.otherId)}`;
    $('msgDetName').textContent = c.otherName;
    $('msgDetTask').innerHTML = `<dt>Task</dt><dd>${esc(c.title)}</dd><dt>Status</dt><dd>${esc(statusLabel(c.status))}</dd>${c.price != null ? `<dt>Price</dt><dd>${esc(money(c.price, c.currency))}</dd>` : ''}<dt>Booking</dt><dd>${esc(String(c.id).slice(0, 8).toUpperCase())}</dd>`;
    $('msgArchiveBtn').textContent = state.archived.has(c.id) ? 'Unarchive conversation' : 'Archive conversation';
    renderSharedFiles();
  }

  async function markRead(id) {
    const c = state.conversations.find(x => x.id === id);
    if (!c) return;
    if (demoMode) { c.unread = 0; renderInbox(); return; }
    if (!state.summaryAvailable) return;
    const { error } = await db.rpc('mark_booking_chat_read', { p_booking_id: id });
    if (!error && c.unread) { c.unread = 0; renderInbox(); }
  }

  async function openAttachment(id) {
    const a = state.attachments[id];
    if (!a || demoMode) return;
    const { data, error } = await db.storage.from(BUCKET).createSignedUrl(a.object_key, 3600);
    if (error || !data?.signedUrl) { toast('Download link is unavailable.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  /* ---------- sending ---------- */
  function renderFiles() {
    $('msgFiles').innerHTML = state.files.map((f, i) =>
      `<span>${esc(f.name)}<button type="button" data-remove="${i}" aria-label="Remove ${esc(f.name)}">&times;</button></span>`).join('');
  }
  async function uploadFiles(bookingId) {
    const out = [];
    for (const file of state.files) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `${state.user.id}/${bookingId}/${crypto.randomUUID()}-${safe}`;
      const { data: up, error } = await db.storage.from(BUCKET).upload(key, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || 'application/octet-stream'
      });
      if (error) throw new Error(error.message || 'Upload failed.');
      const { data: row, error: insertError } = await db.from('chat_attachments').insert({
        booking_id: bookingId, uploader_id: state.user.id, object_key: up?.path || key,
        file_name: file.name, size_bytes: file.size, mime_type: file.type || 'application/octet-stream', status: 'uploaded'
      }).select('*').single();
      if (insertError) throw new Error(insertError.message || 'Upload failed.');
      out.push(row);
    }
    return out;
  }
  async function sendMessage(event) {
    event.preventDefault();
    const body = $('msgInput').value.trim();
    if (!state.activeId || !state.writable || state.blocked || (!body && !state.files.length)) return;
    if (demoMode) { toast('Demo mode: sending is disabled.'); return; }
    const id = state.activeId;
    $('msgSend').disabled = true;
    $('msgInput').disabled = true;
    try {
      const uploaded = await uploadFiles(id);
      const records = [];
      if (body) records.push({ booking_id: id, sender_id: state.user.id, body, message_type: 'text', attachment_id: null });
      uploaded.forEach((f, i) => records.push({
        booking_id: id, sender_id: state.user.id,
        body: body || (uploaded.length === 1 ? 'Shared a file.' : `Shared file ${i + 1} of ${uploaded.length}.`),
        message_type: 'file', attachment_id: f.id
      }));
      const { error } = await db.from('booking_messages').insert(records);
      if (error) throw error;
      $('msgInput').value = '';
      autoGrow();
      state.files = [];
      renderFiles();
      await loadMessages();
      const c = activeConversation();
      if (c) { c.lastBody = body || 'Shared a file.'; c.lastAt = new Date().toISOString(); c.lastMine = true; renderInbox(); }
    } catch (e) {
      toast(e.message || 'Message could not be sent.');
    } finally {
      applyComposerState();
      $('msgInput').focus();
    }
  }
  function autoGrow() {
    const el = $('msgInput');
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  /* ---------- safety ---------- */
  async function submitReport(event) {
    event.preventDefault();
    if (demoMode) { $('msgReportDialog').close(); toast('Demo mode.'); return; }
    const { error } = await db.rpc('report_booking_chat', {
      p_booking_id: state.activeId, p_reason: $('msgReportReason').value,
      p_details: $('msgReportDetails').value.trim() || null
    });
    if (error) { toast(error.message || 'Report failed.'); return; }
    $('msgReportDialog').close();
    $('msgReportForm').reset();
    toast('Report sent. Our team will review it.');
  }
  async function blockChat() {
    if (!state.activeId || demoMode) return;
    if (!confirm('Block this chat? Neither of you will be able to send new messages.')) return;
    const { error } = await db.rpc('block_booking_chat', { p_booking_id: state.activeId });
    if (error) { toast(error.message || 'Could not block chat.'); return; }
    state.blocked = true;
    applyComposerState();
    toast('Chat blocked.');
  }
  async function deleteChat(event) {
    event.preventDefault();
    const id = state.activeId;
    if (!id) return;
    if (demoMode) { $('msgDeleteDialog').close(); toast('Demo mode.'); return; }
    const confirmBtn = $('msgDeleteConfirm');
    confirmBtn.disabled = true;
    try {
      const { data: files, error: filesError } = await db.from('chat_attachments')
        .select('object_key').eq('booking_id', id);
      if (filesError) throw filesError;
      const keys = (files || []).map(f => f.object_key);
      if (keys.length) {
        const { error: removeError } = await db.storage.from(BUCKET).remove(keys);
        if (removeError) throw removeError;
      }
      const { error } = await db.rpc('delete_booking_chat', { p_booking_id: id });
      if (error) throw error;
      $('msgDeleteDialog').close();
      stopChatTimer();
      state.activeId = null;
      setView('inbox');
      await refreshInbox();
      toast('Chat permanently deleted for both of you.');
    } catch (e) {
      toast(e.message || 'Could not delete the chat.');
    } finally {
      confirmBtn.disabled = false;
    }
  }
  function toggleArchive() {
    const id = state.activeId;
    if (!id) return;
    if (state.archived.has(id)) state.archived.delete(id); else state.archived.add(id);
    saveArchived();
    fillDetails(activeConversation());
    renderInbox();
    toast(state.archived.has(id) ? 'Conversation archived.' : 'Conversation restored.');
  }
  function toggleDetails(force) {
    const open = typeof force === 'boolean' ? force : $('msgDetails').hidden;
    $('msgDetails').hidden = !open;
    $('msgApp').classList.toggle('has-details', open);
  }

  /* ---------- init ---------- */
  function bind() {
    $('msgList').addEventListener('click', e => {
      const item = e.target.closest('[data-id]');
      if (item) openConversation(item.dataset.id);
    });
    $('msgSearch').addEventListener('input', e => { state.query = e.target.value; renderInbox(); });
    document.querySelector('.msg-filters').addEventListener('click', e => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      state.filter = btn.dataset.filter;
      document.querySelectorAll('.msg-filters button').forEach(b => b.classList.toggle('is-active', b === btn));
      renderInbox();
    });
    $('msgBack').addEventListener('click', () => { stopChatTimer(); state.activeId = null; setView('inbox'); renderInbox(); });
    $('msgDetailsToggle').addEventListener('click', () => toggleDetails());
    $('msgForm').addEventListener('submit', sendMessage);
    $('msgInput').addEventListener('input', autoGrow);
    $('msgInput').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('msgForm').requestSubmit(); }
    });
    $('msgFile').addEventListener('change', e => {
      Array.from(e.target.files || []).forEach(f => {
        if (f.size <= 0 || f.size > MAX_FILE_BYTES) toast(`${f.name}: file is too large.`);
        else state.files.push(f);
      });
      e.target.value = '';
      renderFiles();
    });
    $('msgFiles').addEventListener('click', e => {
      const btn = e.target.closest('[data-remove]');
      if (btn) { state.files.splice(Number(btn.dataset.remove), 1); renderFiles(); }
    });
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-attachment]');
      if (btn) openAttachment(btn.dataset.attachment);
    });
    $('msgArchiveBtn').addEventListener('click', toggleArchive);
    $('msgReportBtn').addEventListener('click', () => $('msgReportDialog').showModal());
    $('msgReportCancel').addEventListener('click', () => $('msgReportDialog').close());
    $('msgReportForm').addEventListener('submit', submitReport);
    $('msgBlockBtn').addEventListener('click', blockChat);
    $('msgDeleteBtn').addEventListener('click', () => $('msgDeleteDialog').showModal());
    $('msgDeleteCancel').addEventListener('click', () => $('msgDeleteDialog').close());
    $('msgDeleteForm').addEventListener('submit', deleteChat);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshInbox(); });
    if (window.matchMedia('(min-width: 1101px)').matches) toggleDetails(true);
  }

  async function refreshInbox() {
    if (demoMode || !state.user) return;
    try {
      await loadConversations();
      renderInbox();
    } catch (e) { /* keep the current list on a transient failure */ }
  }

  async function init() {
    bind();
    if (demoMode) {
      await loadConversations();
      renderInbox();
      return;
    }
    if (!db) { $('msgList').innerHTML = '<p class="msg-state">Messages are unavailable. Please check your connection.</p>'; return; }
    const { data } = await db.auth.getSession();
    if (!data?.session) { location.replace('auth.html?mode=signin'); return; }
    state.user = data.session.user;
    loadArchived();
    try {
      await loadConversations();
      renderInbox();
      const wanted = new URLSearchParams(location.search).get('booking');
      if (wanted) openConversation(wanted);
    } catch (e) {
      $('msgList').innerHTML = '<p class="msg-state">Could not load conversations. Please try again.</p>';
    }
    state.inboxTimer = setInterval(() => { if (!document.hidden) refreshInbox(); }, 20000);
  }

  init();
})();
