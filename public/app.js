/* =====================================================================
   WasteWise AI — Frontend Application
   ChatGPT-like interface with multi-agent municipal waste management
   ===================================================================== */

// ── State ──────────────────────────────────────────────────────────────
const State = {
  messages:       [],
  isLoading:      false,
  preferredLang:  'auto',   // auto|en|hi|gu
  voiceRecording: false,
  dashData:       null,
  currentConvId:  null,
  conversations:  JSON.parse(localStorage.getItem('ww_convs') || '[]')
};

// ── DOM references ─────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const chatMessages  = $('chatMessages');
const chatInput     = $('chatInput');
const sendBtn       = $('sendBtn');
const voiceBtn      = $('voiceBtn');
const agentStatus   = $('agentStatus');
const statusText    = $('statusText');
const agentBadge    = $('agentBadge');
const welcomeScreen = $('welcomeScreen');
const charCount     = $('charCount');
const chatView      = $('chatView');
const dashView      = $('dashboardView');

// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderConvHistory();
  newConversation();
  loadDashboard();
});

// ── Event Listeners ────────────────────────────────────────────────────
function setupEventListeners() {
  // Send on button click
  sendBtn.addEventListener('click', handleSend);

  // Send on Enter (Shift+Enter for newline)
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Char count & auto-resize
  chatInput.addEventListener('input', () => {
    charCount.textContent = `${chatInput.value.length} / 2000`;
    autoResize(chatInput);
  });

  // Suggested prompts
  document.querySelectorAll('.prompt-chip').forEach(btn => {
    btn.addEventListener('click', () => sendPrompt(btn.dataset.prompt));
  });

  // New chat
  $('newChatBtn').addEventListener('click', newConversation);

  // Dashboard open/close
  $('dashboardBtn').addEventListener('click', showDashboard);
  $('dashNavBtn').addEventListener('click', showDashboard);
  $('closeDashBtn').addEventListener('click', showChat);

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.preferredLang = btn.dataset.lang;
    });
  });

  // Dashboard tabs
  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`tab${capitalize(tab.dataset.tab)}`).classList.add('active');
    });
  });

  // Voice
  voiceBtn.addEventListener('click', toggleVoice);
}

// ── Conversation Management ────────────────────────────────────────────
function newConversation() {
  State.messages    = [];
  State.currentConvId = Date.now();
  chatMessages.innerHTML = '';
  welcomeScreen.classList.remove('hidden');
  chatMessages.classList.add('hidden');
  agentStatus.classList.add('hidden');
  agentBadge.textContent = 'WasteWise AI';
  chatInput.value = '';
  charCount.textContent = '0 / 2000';
}

function saveConversation(title) {
  const existing = State.conversations.findIndex(c => c.id === State.currentConvId);
  const conv = { id: State.currentConvId, title: title.slice(0, 48), ts: Date.now() };
  if (existing >= 0) { State.conversations[existing] = conv; }
  else { State.conversations.unshift(conv); }
  State.conversations = State.conversations.slice(0, 20);
  localStorage.setItem('ww_convs', JSON.stringify(State.conversations));
  renderConvHistory();
}

function renderConvHistory() {
  const container = $('convHistory');
  if (!State.conversations.length) {
    container.innerHTML = '<div style="padding:8px 10px;font-size:11px;color:var(--text3)">No recent conversations</div>';
    return;
  }
  container.innerHTML = State.conversations.map(c => `
    <button class="conv-item ${c.id === State.currentConvId ? 'active' : ''}"
            onclick="loadConversation(${c.id})"
            title="${escHtml(c.title)}">
      💬 ${escHtml(c.title)}
    </button>
  `).join('');
}

function loadConversation(id) {
  const conv = State.conversations.find(c => c.id === id);
  if (conv) { State.currentConvId = id; renderConvHistory(); }
}

// ── Send / Receive ─────────────────────────────────────────────────────
async function handleSend() {
  const text = chatInput.value.trim();
  if (!text || State.isLoading) return;
  chatInput.value = '';
  charCount.textContent = '0 / 2000';
  autoResize(chatInput);
  await sendMessage(text);
}

async function sendPrompt(text) {
  if (State.isLoading) return;
  chatInput.value = '';
  await sendMessage(text);
}

async function sendMessage(text) {
  if (!text || State.isLoading) return;
  State.isLoading = true;
  setSendDisabled(true);

  // Hide welcome, show messages
  welcomeScreen.classList.add('hidden');
  chatMessages.classList.remove('hidden');

  // Add user message
  appendMessage('user', text, 'You');
  State.messages.push({ role: 'user', content: text });

  // Prefix message with language preference if set
  let apiMessage = text;
  if (State.preferredLang !== 'auto') {
    const langNote = { en: '[Please respond in English]', hi: '[Please respond in Hindi/हिंदी]', gu: '[Please respond in Gujarati/ગુજરાતી]' };
    apiMessage = `${langNote[State.preferredLang]} ${text}`;
  }

  // Show typing
  const typingId = showTyping();

  // Show agent status
  agentStatus.classList.remove('hidden');
  statusText.textContent = 'Analyzing your request...';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: apiMessage,
        history: State.messages.slice(-20, -1)
      })
    });

    const data = await res.json();

    removeTyping(typingId);
    agentStatus.classList.add('hidden');

    if (!res.ok || data.error) {
      const errMsg = data.error || 'Something went wrong. Please try again.';
      appendMessage('assistant', `⚠️ ${errMsg}`, 'WasteWise AI', 'WasteWise AI');
      State.messages.push({ role: 'assistant', content: errMsg });
    } else {
      const agentName = data.agentName || 'WasteWise AI';
      agentBadge.textContent = agentName;
      appendMessage('assistant', data.message, agentName, agentName);
      State.messages.push({ role: 'assistant', content: data.message });
      saveConversation(text);

      // Refresh dashboard data if analytics query
      if (['ward_analytics','dashboard_query','route_optimization'].includes(data.intent)) {
        loadDashboard();
      }
    }
  } catch (err) {
    removeTyping(typingId);
    agentStatus.classList.add('hidden');
    const fallback = 'The service is currently unreachable. Please check your connection and try again.';
    appendMessage('assistant', `⚠️ ${fallback}`, 'WasteWise AI');
    State.messages.push({ role: 'assistant', content: fallback });
  }

  State.isLoading = false;
  setSendDisabled(false);
  chatInput.focus();
}

// ── Message Rendering ──────────────────────────────────────────────────
function appendMessage(role, content, senderName, agentLabel) {
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  const avatar  = role === 'user' ? '👤' : '♻';
  const time    = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const label   = senderName || (role === 'user' ? 'You' : 'WasteWise AI');

  row.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-bubble">
      <div class="msg-meta">
        <span class="msg-sender">${escHtml(label)}</span>
        <span>${time}</span>
        ${agentLabel && role === 'assistant' ? `<span class="badge" style="background:var(--accent-glow);color:var(--accent);font-size:9px;">${escHtml(agentLabel)}</span>` : ''}
      </div>
      <div class="msg-body">${renderMarkdown(content)}</div>
      ${role === 'assistant' ? `
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this)">📋 Copy</button>
          <button class="msg-action-btn" onclick="retryMsg()">↺ Retry</button>
          ${typeof speechSynthesis !== 'undefined' ? `<button class="msg-action-btn" onclick="speakMsg(this)">🔊 Speak</button>` : ''}
        </div>
      ` : ''}
    </div>
  `;

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return row;
}

function showTyping() {
  const id = `typing-${Date.now()}`;
  const row = document.createElement('div');
  row.id = id;
  row.className = 'msg-row assistant';
  row.innerHTML = `
    <div class="msg-avatar">♻</div>
    <div class="msg-bubble">
      <div class="msg-meta"><span class="msg-sender">WasteWise AI</span></div>
      <div class="msg-body"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>
    </div>`;
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = $(id);
  if (el) el.remove();
}

// ── Markdown Renderer (lightweight) ───────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = escHtml(text);

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');

  // Unordered lists
  html = html.replace(/((?:^[•\-\*] .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[•\-\*] /, '').trim()}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '').trim()}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;

  // Clean up empty p tags
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ol>)/g, '$1');
  html = html.replace(/(<\/ol>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return html;
}

// ── Message Actions ────────────────────────────────────────────────────
function copyMsg(btn) {
  const body = btn.closest('.msg-bubble').querySelector('.msg-body');
  navigator.clipboard.writeText(body.innerText).then(() => {
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
  });
}

function retryMsg() {
  if (State.isLoading) return;
  const lastUser = [...State.messages].reverse().find(m => m.role === 'user');
  if (lastUser) {
    // Remove last assistant message from state
    while (State.messages.length && State.messages[State.messages.length-1].role === 'assistant') {
      State.messages.pop();
    }
    // Remove last assistant message row from DOM
    const rows = chatMessages.querySelectorAll('.msg-row.assistant');
    if (rows.length) rows[rows.length-1].remove();

    sendMessage(lastUser.content);
  }
}

function speakMsg(btn) {
  const body = btn.closest('.msg-bubble').querySelector('.msg-body');
  const utterance = new SpeechSynthesisUtterance(body.innerText);
  utterance.lang = 'en-IN';
  speechSynthesis.speak(utterance);
  btn.textContent = '🔇 Stop';
  utterance.onend = () => { btn.textContent = '🔊 Speak'; };
  btn.onclick = () => { speechSynthesis.cancel(); btn.textContent = '🔊 Speak'; btn.onclick = () => speakMsg(btn); };
}

// ── Voice Input ────────────────────────────────────────────────────────
let recognition = null;

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in your browser. Please use Chrome.');
    return;
  }

  if (State.voiceRecording) {
    recognition && recognition.stop();
    State.voiceRecording = false;
    voiceBtn.classList.remove('voice-active');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  // Set language
  const langMap = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN', auto: 'en-IN' };
  recognition.lang = langMap[State.preferredLang] || 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    State.voiceRecording = true;
    voiceBtn.classList.add('voice-active');
    chatInput.placeholder = 'Listening...';
  };

  recognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    chatInput.value = transcript;
    charCount.textContent = `${transcript.length} / 2000`;
    autoResize(chatInput);
  };

  recognition.onend = () => {
    State.voiceRecording = false;
    voiceBtn.classList.remove('voice-active');
    chatInput.placeholder = 'Ask about waste management, report a complaint, or request analytics... (English / हिंदी / ગુજરાતી)';
  };

  recognition.onerror = (e) => {
    State.voiceRecording = false;
    voiceBtn.classList.remove('voice-active');
    chatInput.placeholder = 'Ask about waste management, report a complaint, or request analytics... (English / हिंदी / ગુજरাতી)';
    if (e.error !== 'aborted') console.error('Speech error:', e.error);
  };

  recognition.start();
}

// ── Dashboard ──────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const res  = await fetch('/api/dashboard');
    const data = await res.json();
    State.dashData = data;
    renderDashboard(data);
  } catch (err) {
    console.warn('Dashboard load failed — server may not be running yet');
    renderDashboardFallback();
  }
}

function showDashboard() {
  chatView.classList.add('hidden');
  dashView.classList.remove('hidden');
  if (State.dashData) renderDashboard(State.dashData);
  else loadDashboard();
}

function showChat() {
  dashView.classList.add('hidden');
  chatView.classList.remove('hidden');
}

function renderDashboard(data) {
  if (!data) return;
  const s = data.systemStats || {};

  // KPIs
  const kpiGrid = $('kpiGrid');
  kpiGrid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-icon">🗑</div>
      <div class="kpi-value green">${s.totalWasteCollectedToday || '--'} t</div>
      <div class="kpi-label">Waste Collected Today</div>
      <div class="kpi-sub">DEMO data</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon">♻</div>
      <div class="kpi-value cyan">${s.overallSegregationRate || '--'}%</div>
      <div class="kpi-label">Segregation Rate</div>
      <div class="kpi-sub">City Average</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon">🚛</div>
      <div class="kpi-value blue">${s.activeVehicles || '--'}/${s.totalVehicles || '--'}</div>
      <div class="kpi-label">Active Vehicles</div>
      <div class="kpi-sub">Fleet Status</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon">📋</div>
      <div class="kpi-value orange">${s.pendingComplaints || '--'}</div>
      <div class="kpi-label">Pending Complaints</div>
      <div class="kpi-sub">${s.resolvedComplaints || 0} resolved today</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon">⚡</div>
      <div class="kpi-value green">${s.collectionEfficiency || '--'}%</div>
      <div class="kpi-label">Collection Efficiency</div>
      <div class="kpi-sub">City Average</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon">📅</div>
      <div class="kpi-value" style="font-size:13px;color:var(--text2)">${s.date || 'DEMO'}</div>
      <div class="kpi-label">Data Date</div>
      <div class="kpi-sub">Simulated</div>
    </div>
  `;

  // Wards tab
  const wards = data.wards || [];
  $('tabWards').innerHTML = `
    <div style="overflow-x:auto">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Ward</th>
            <th>Collected</th>
            <th>Segregation</th>
            <th>Wet/Dry/Haz/Mix</th>
            <th>Complaints</th>
            <th>Resolution</th>
            <th>Route Eff.</th>
          </tr>
        </thead>
        <tbody>
          ${wards.map(w => {
            const eff = ((w.wasteCollected/w.wasteGenerated)*100).toFixed(1);
            const resRate = w.complaints > 0 ? ((w.resolvedComplaints/w.complaints)*100).toFixed(0) : 100;
            const segColor = w.segregationPct >= 85 ? 'green' : w.segregationPct >= 70 ? 'orange' : 'red';
            return `
              <tr>
                <td><strong>W${w.id}</strong><br><span style="font-size:11px;color:var(--text3)">${w.name}</span></td>
                <td>${w.wasteCollected}/${w.wasteGenerated} t<br>
                    <span style="font-size:10px;color:${eff>=90?'var(--accent)':eff>=80?'var(--orange)':'var(--red)'}">${eff}%</span></td>
                <td>
                  <span class="prog-bar"><span class="prog-fill ${segColor}" style="width:${w.segregationPct}%"></span></span>
                  <span style="color:${w.segregationPct>=85?'var(--accent)':w.segregationPct>=70?'var(--orange)':'var(--red)'}">${w.segregationPct}%</span>
                </td>
                <td>
                  <div class="seg-bars">
                    <div class="seg-wet" style="width:${w.wetWastePct}%"></div>
                    <div class="seg-dry" style="width:${w.dryWastePct}%"></div>
                    <div class="seg-haz" style="width:${w.hazardousPct}%"></div>
                    <div class="seg-mix" style="width:${w.mixedPct}%"></div>
                  </div>
                  <div style="font-size:10px;color:var(--text3);margin-top:3px">W:${w.wetWastePct}% D:${w.dryWastePct}% H:${w.hazardousPct}% M:${w.mixedPct}%</div>
                </td>
                <td>${w.complaints} total<br><span style="font-size:10px;color:var(--text3)">${w.complaints-w.resolvedComplaints} open</span></td>
                <td>
                  <span class="prog-bar"><span class="prog-fill ${resRate>=80?'green':resRate>=50?'orange':'red'}" style="width:${resRate}%"></span></span>
                  ${resRate}%
                </td>
                <td>
                  <span class="prog-bar"><span class="prog-fill ${w.routeEfficiency>=90?'green':w.routeEfficiency>=75?'orange':'red'}" style="width:${w.routeEfficiency}%"></span></span>
                  ${w.routeEfficiency}%
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Vehicles tab
  const vehicles = data.vehicles || [];
  $('tabVehicles').innerHTML = `
    <div style="overflow-x:auto">
      <table class="dash-table">
        <thead>
          <tr><th>Vehicle ID</th><th>Type</th><th>Capacity</th><th>Ward</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${vehicles.map(v => `
            <tr>
              <td><strong>${v.id}</strong></td>
              <td>${v.type}</td>
              <td>${v.capacity} t</td>
              <td>Ward ${v.ward}</td>
              <td><span class="badge ${v.status}">${v.status.charAt(0).toUpperCase()+v.status.slice(1)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Complaints tab
  const complaints = data.complaints || [];
  $('tabComplaints').innerHTML = `
    <div style="overflow-x:auto">
      <table class="dash-table">
        <thead>
          <tr><th>Ticket ID</th><th>Type</th><th>Ward</th><th>Area</th><th>Priority</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${complaints.map(c => `
            <tr>
              <td><strong>${c.id}</strong></td>
              <td>${c.type}</td>
              <td>Ward ${c.ward}</td>
              <td>${c.area}</td>
              <td><span class="badge ${c.priority.toLowerCase()}">${c.priority}</span></td>
              <td><span class="badge ${c.status.toLowerCase().replace(' ','-')}">${c.status}</span></td>
              <td>${c.date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Alerts tab
  const alerts = data.alerts || [];
  $('tabAlerts').innerHTML = `
    <div class="alert-list">
      ${alerts.length ? alerts.map(a => `
        <div class="alert-card ${a.type}">
          <div class="alert-icon">${a.type==='danger'?'🔴':a.type==='warning'?'🟡':'🔵'}</div>
          <div class="alert-msg">${escHtml(a.msg)}</div>
        </div>
      `).join('') : '<div style="padding:20px;color:var(--text3);text-align:center">No active alerts</div>'}
    </div>
  `;
}

function renderDashboardFallback() {
  $('kpiGrid').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-icon">⚠️</div>
      <div class="kpi-value" style="font-size:14px;color:var(--orange)">Server Offline</div>
      <div class="kpi-label">Start the Node.js server</div>
      <div class="kpi-sub">Run: npm start</div>
    </div>
  `;
}

// ── Sidebar toggle (mobile) ────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = $('sidebar');
  const overlay = $('overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('overlay').classList.remove('open');
}

// ── Utilities ──────────────────────────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
}

function setSendDisabled(disabled) {
  sendBtn.disabled = disabled;
  chatInput.disabled = disabled;
}

function escHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Expose globally for inline onclick handlers
window.sendPrompt    = sendPrompt;
window.closeSidebar  = closeSidebar;
window.toggleSidebar = toggleSidebar;
window.copyMsg       = copyMsg;
window.retryMsg      = retryMsg;
window.speakMsg      = speakMsg;
window.loadConversation = loadConversation;
