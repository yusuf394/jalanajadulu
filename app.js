// ================================================================
//  JALANAJADULU.COM — app.js
//  Full application logic: Notes, Tasks, Pomodoro, Jule AI
// ================================================================

// Ganti dengan API key Anthropic kamu sendiri
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

// ── STATE ──
let state = {
  notes: [],
  tasks: [],
  currentMood: null,
  currentMoodLabel: '',
};

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  startClock();
  updateGreeting();
  loadMotivation();
  updateDashboardStats();
  renderQuickTaskList();
  renderNotes();
  renderTasks();
  updatePomoTaskSelect();
  renderSessionDots();
});

// ── PERSIST ──
function saveState() {
  localStorage.setItem('jjd_state', JSON.stringify(state));
}
function loadState() {
  try {
    const s = localStorage.getItem('jjd_state');
    if (s) state = { ...state, ...JSON.parse(s) };
  } catch(e) {}
}
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// ── NAVIGATION ──
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  if (window.innerWidth <= 960) closeSidebar();
  if (page === 'tasks') renderTasks();
  if (page === 'notes') renderNotes();
  if (page === 'pomodoro') updatePomoTaskSelect();
}

// ── SIDEBAR ──
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  sb.classList.toggle('open');
  ov.classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
}

// ── CLOCK ──
function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  const el = document.getElementById('clockDisplay');
  if (el) el.textContent = `${h}:${m}:${s}`;
}

// ── GREETING ──
function updateGreeting() {
  const hr = new Date().getHours();
  const greets = [
    [5,  'Masih terjaga?'],
    [11, 'Selamat Pagi'],
    [15, 'Selamat Siang'],
    [18, 'Selamat Sore'],
    [24, 'Selamat Malam'],
  ];
  const label = greets.find(([h]) => hr < h)?.[1] || 'Halo';
  const el = document.getElementById('greetingText');
  if (el) el.textContent = label;

  const dateEl = document.getElementById('dateText');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}

// ── MOTIVATION ──
const MOTIVATIONS = [
  "Setiap langkah kecil adalah kemajuan nyata. Kamu lebih kuat dari yang kamu bayangkan.",
  "Hari ini mungkin terasa berat, tapi kamu sudah melewati hari-hari sulit sebelumnya.",
  "Tidak perlu sempurna — cukup menjadi sedikit lebih baik dari kemarin.",
  "Istirahat bukan kelemahan. Itu bagian dari strategi yang bijak.",
  "Kamu sedang membangun versi terbaik dari dirimu. Prosesnya memang butuh waktu.",
  "Kesalahan bukan kegagalan — itu data berharga yang membuatmu tumbuh.",
  "Satu kegiatan selesai hari ini sudah lebih dari cukup untuk diapresiasi.",
  "Jangan bandingkan perjalananmu dengan orang lain. Jalanmu adalah milikmu sendiri.",
  "Kamu punya semua yang dibutuhkan untuk melewati hari ini.",
  "Bersyukur untuk hal-hal kecil membuka ruang untuk hal-hal yang lebih besar.",
  "Produktif bukan berarti sibuk. Pilih yang benar-benar penting.",
  "Tidur cukup dan makan dengan baik adalah investasi terbaik untuk produktivitasmu.",
  "Kamu tidak harus merasa termotivasi untuk memulai — cukup mulai, motivasi akan menyusul.",
  "Fokus pada hal yang bisa kamu kendalikan hari ini. Sisanya, lepaskan dengan ikhlas.",
  "Setiap pagi adalah halaman baru. Kamu yang memegang penanya.",
];

function loadMotivation() {
  const el = document.getElementById('motivationText');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity = '1';
  }, 180);
}

// ── MOOD ──
function setMood(key, label) {
  state.currentMood = key;
  state.currentMoodLabel = label;
  saveState();

  document.querySelectorAll('.mf-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.mf-btn[onclick*="'${key}'"]`)?.classList.add('active');

  const el = document.getElementById('currentMood');
  if (el) el.textContent = `Mood kamu: ${label}`;

  showToast(`Mood dicatat: ${label}`);
  if (key === 'stres' || key === 'sedih') {
    setTimeout(() => showToast('Yuk ngobrol dengan Jule — dia siap mendengarkan.'), 2500);
  }
}

// ── DASHBOARD STATS ──
function updateDashboardStats() {
  const today = getTodayKey();
  const todayNotes = state.notes.filter(n => n.createdAt?.startsWith(today)).length;
  const done = state.tasks.filter(t => t.done).length;
  const pending = state.tasks.filter(t => !t.done).length;
  const pomos = parseInt(localStorage.getItem(`pomo_${today}`) || '0');
  setTxt('statNotes', todayNotes);
  setTxt('statTasksDone', done);
  setTxt('statTasksPending', pending);
  setTxt('statPomodoros', pomos);
}
function setTxt(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

// ── QUICK NOTE ──
function saveQuickNote() {
  const inp = document.getElementById('quickNoteInput');
  if (!inp?.value.trim()) return showToast('Tulis sesuatu dulu sebelum disimpan.');
  state.notes.unshift({
    id: Date.now(),
    title: 'Catatan Cepat',
    content: inp.value.trim(),
    mood: state.currentMood || 'biasa',
    category: 'pribadi',
    createdAt: new Date().toISOString(),
  });
  saveState();
  inp.value = '';
  updateDashboardStats();
  showToast('Catatan berhasil disimpan.');
  confetti();
}

// ── QUICK TASK ──
function saveQuickTask() {
  const inp = document.getElementById('quickTaskInput');
  if (!inp?.value.trim()) return showToast('Masukkan nama kegiatan terlebih dahulu.');
  state.tasks.unshift({
    id: Date.now(),
    title: inp.value.trim(),
    desc: '', priority: 'medium', category: 'pribadi', deadline: '',
    done: false, createdAt: new Date().toISOString(),
  });
  saveState();
  inp.value = '';
  renderQuickTaskList();
  updateDashboardStats();
  updateProgressBar();
  showToast('Kegiatan ditambahkan.');
}

function renderQuickTaskList() {
  const c = document.getElementById('quickTaskList');
  if (!c) return;
  const recent = state.tasks.slice(0, 5);
  if (!recent.length) {
    c.innerHTML = '<p style="font-size:0.78rem;color:var(--ink-4);text-align:center;padding:8px">Belum ada kegiatan</p>';
    return;
  }
  c.innerHTML = recent.map(t => `
    <div class="qt-item">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTaskDone(${t.id},this.checked)" />
      <span style="${t.done ? 'text-decoration:line-through;color:var(--ink-4)' : ''}">${esc(t.title)}</span>
    </div>`).join('');
}

// ── NOTES ──
let editNoteId = null;
let selectedNoteMood = 'senang';

function openNoteModal(noteId) {
  const modal = document.getElementById('noteModal');
  modal.classList.add('open');
  editNoteId = noteId || null;
  selectedNoteMood = 'senang';

  if (noteId) {
    const note = state.notes.find(n => n.id === noteId);
    if (note) {
      document.getElementById('noteTitle').value = note.title === 'Tanpa Judul' ? '' : note.title;
      document.getElementById('noteContent').value = note.content;
      document.getElementById('noteCategory').value = note.category;
      selectedNoteMood = note.mood || 'senang';
    }
  } else {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteCategory').value = 'pribadi';
  }

  document.querySelectorAll('.mood-chip').forEach(b => {
    b.classList.toggle('active', b.dataset.mood === selectedNoteMood);
  });
}
function closeNoteModal() {
  document.getElementById('noteModal').classList.remove('open');
  editNoteId = null;
}
function selectNoteMood(btn) {
  selectedNoteMood = btn.dataset.mood;
  document.querySelectorAll('.mood-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function saveNote() {
  const content = document.getElementById('noteContent').value.trim();
  if (!content) return showToast('Isi catatan tidak boleh kosong.');
  const title = document.getElementById('noteTitle').value.trim() || 'Tanpa Judul';
  const category = document.getElementById('noteCategory').value;

  if (editNoteId) {
    const idx = state.notes.findIndex(n => n.id === editNoteId);
    if (idx !== -1) {
      state.notes[idx] = { ...state.notes[idx], title, content, category, mood: selectedNoteMood };
    }
  } else {
    state.notes.unshift({
      id: Date.now(), title, content,
      mood: selectedNoteMood, category,
      createdAt: new Date().toISOString()
    });
  }
  saveState();
  closeNoteModal();
  renderNotes();
  updateDashboardStats();
  showToast(editNoteId ? 'Catatan diperbarui.' : 'Catatan disimpan.');
  if (!editNoteId) confetti();
}
function deleteNote(id) {
  if (!confirm('Hapus catatan ini?')) return;
  state.notes = state.notes.filter(n => n.id !== id);
  saveState(); renderNotes(); updateDashboardStats();
  showToast('Catatan dihapus.');
}
function filterNotes() {
  renderNotes(
    document.getElementById('noteSearch')?.value.toLowerCase() || '',
    document.getElementById('noteMoodFilter')?.value || ''
  );
}

const CAT_LABELS = {
  pribadi:'Pribadi', kerja:'Kerja', ide:'Ide',
  refleksi:'Refleksi', syukur:'Rasa Syukur'
};
const MOOD_DOT_CLASS = {
  senang:'mood-dot-senang', biasa:'mood-dot-biasa', sedih:'mood-dot-sedih',
  stres:'mood-dot-stres', semangat:'mood-dot-semangat'
};
const STRIPE_CLASS = {
  pribadi:'stripe-pribadi', kerja:'stripe-kerja', ide:'stripe-ide',
  refleksi:'stripe-refleksi', syukur:'stripe-syukur'
};

function renderNotes(search='', moodFilter='') {
  const c = document.getElementById('notesGrid');
  if (!c) return;
  let list = state.notes;
  if (search) list = list.filter(n =>
    n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search)
  );
  if (moodFilter) list = list.filter(n => n.mood === moodFilter);

  if (!list.length) {
    c.innerHTML = `
      <div class="empty-state">
        <div class="empty-art">
          <svg viewBox="0 0 90 90" fill="none" width="90" height="90">
            <rect x="14" y="18" width="62" height="60" rx="7" fill="#EDE8E0" stroke="#D4CCBF" stroke-width="2"/>
            <line x1="26" y1="36" x2="64" y2="36" stroke="#C4BAB0" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="26" y1="46" x2="64" y2="46" stroke="#C4BAB0" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="26" y1="56" x2="48" y2="56" stroke="#C4BAB0" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-ttl">${search || moodFilter ? 'Tidak ditemukan' : 'Belum ada catatan'}</p>
        <p class="empty-dsc">${search || moodFilter ? 'Coba kata kunci lain' : 'Mulai tulis pikiran dan perasaanmu'}</p>
      </div>`;
    return;
  }

  c.innerHTML = list.map(n => `
    <div class="note-card ${STRIPE_CLASS[n.category] || ''}" onclick="openNoteModal(${n.id})">
      <div class="nc-header">
        <div class="nc-title">${esc(n.title)}</div>
        <div class="nc-mood-dot ${MOOD_DOT_CLASS[n.mood] || ''}"></div>
      </div>
      <div class="nc-body">${esc(n.content)}</div>
      <div class="nc-footer">
        <span class="nc-date">${fmtDate(n.createdAt)}</span>
        <div style="display:flex;gap:7px;align-items:center">
          <span class="nc-tag">${CAT_LABELS[n.category] || n.category}</span>
          <button class="nc-del" onclick="event.stopPropagation();deleteNote(${n.id})">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" stroke-linecap="round">
              <polyline points="2 5 4 5 16 5"/>
              <path d="M6 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              <path d="M14 5l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`).join('');
}

// ── TASKS ──
let taskFilter = 'all';

function openTaskModal() {
  document.getElementById('taskModal').classList.add('open');
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskPriority').value = 'medium';
  document.getElementById('taskDeadline').value = '';
  document.getElementById('taskCategory').value = 'kerja';
}
function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('open');
}
function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) return showToast('Nama kegiatan tidak boleh kosong.');
  state.tasks.unshift({
    id: Date.now(), title,
    desc: document.getElementById('taskDesc').value.trim(),
    priority: document.getElementById('taskPriority').value,
    category: document.getElementById('taskCategory').value,
    deadline: document.getElementById('taskDeadline').value,
    done: false, createdAt: new Date().toISOString(),
  });
  saveState(); closeTaskModal(); renderTasks();
  renderQuickTaskList(); updateDashboardStats(); updateProgressBar(); updatePomoTaskSelect();
  showToast('Kegiatan berhasil ditambahkan.');
}
function toggleTaskDone(id, val) {
  const t = state.tasks.find(t => t.id === id);
  if (!t) return;
  t.done = val;
  saveState(); renderTasks(); renderQuickTaskList(); updateDashboardStats(); updateProgressBar();
  if (val) { showToast('Selesai! Kerja bagus.'); confetti(); }
}
function deleteTask(id) {
  if (!confirm('Hapus kegiatan ini?')) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState(); renderTasks(); renderQuickTaskList();
  updateDashboardStats(); updateProgressBar(); updatePomoTaskSelect();
  showToast('Kegiatan dihapus.');
}
function filterTasks(f, btn) {
  taskFilter = f;
  document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

const PRI_LABELS = { high:'Tinggi', medium:'Sedang', low:'Rendah' };
const CAT_TASK_LABELS = {
  kerja:'Kerja', pribadi:'Pribadi', belajar:'Belajar',
  kesehatan:'Kesehatan', lainnya:'Lainnya'
};

function renderTasks() {
  const c = document.getElementById('tasksList');
  if (!c) return;
  let list = [...state.tasks];
  if (taskFilter === 'pending') list = list.filter(t => !t.done);
  else if (taskFilter === 'done') list = list.filter(t => t.done);
  else if (taskFilter === 'high') list = list.filter(t => t.priority === 'high');
  list.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const p = { high:0, medium:1, low:2 };
    return (p[a.priority] || 1) - (p[b.priority] || 1);
  });

  if (!list.length) {
    c.innerHTML = `
      <div class="empty-state">
        <div class="empty-art">
          <svg viewBox="0 0 90 90" fill="none" width="90" height="90">
            <rect x="14" y="22" width="62" height="56" rx="7" fill="#EDE8E0" stroke="#D4CCBF" stroke-width="2"/>
            <polyline points="26,42 33,49 48,34" stroke="#9DC49A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="56" y1="41" x2="68" y2="41" stroke="#C4BAB0" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-ttl">${taskFilter !== 'all' ? 'Tidak ada kegiatan' : 'Belum ada kegiatan'}</p>
        <p class="empty-dsc">Tambahkan kegiatan baru dan mulai produktif</p>
      </div>`;
    return;
  }

  c.innerHTML = list.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}">
      <div class="t-check ${t.done ? 'checked' : ''}" onclick="toggleTaskDone(${t.id},${!t.done})"></div>
      <div class="t-info">
        <div class="t-title">${esc(t.title)}</div>
        ${t.desc ? `<div class="t-desc">${esc(t.desc)}</div>` : ''}
        <div class="t-tags">
          <span class="t-tag tag-${t.priority}">${PRI_LABELS[t.priority]}</span>
          <span class="t-tag tag-cat">${CAT_TASK_LABELS[t.category] || t.category}</span>
          ${t.deadline ? `<span class="t-tag tag-date">${fmtDate(t.deadline)}</span>` : ''}
        </div>
      </div>
      <button class="t-del" onclick="deleteTask(${t.id})">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" stroke-linecap="round">
          <polyline points="2 5 4 5 16 5"/>
          <path d="M6 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          <path d="M14 5l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 5"/>
        </svg>
      </button>
    </div>`).join('');

  updateProgressBar();
}

function updateProgressBar() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round(done / total * 100);
  const fill = document.getElementById('progressFill');
  const pctEl = document.getElementById('progressPercent');
  if (fill) fill.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
}

// ── POMODORO ──
let pomoRunning = false, pomoInterval = null;
let pomoSeconds = 25 * 60, pomoTotal = 25 * 60;
let pomoMode = 'work';

const POMO_MODES = {
  work:  { s: 25*60, label: 'Waktu Fokus',      color: '#C8624A' },
  short: { s:  5*60, label: 'Istirahat Pendek',  color: '#6B8F71' },
  long:  { s: 15*60, label: 'Istirahat Panjang', color: '#5A6A7A' },
};

function setPomoMode(mode, btn) {
  if (pomoRunning) return showToast('Hentikan timer terlebih dahulu.');
  pomoMode = mode;
  document.querySelectorAll('.pmode').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  resetPomodoro();
}
function togglePomodoro() {
  pomoRunning ? pausePomodoro() : startPomodoro();
}
function startPomodoro() {
  pomoRunning = true;
  document.getElementById('playIcon').style.display = 'none';
  document.getElementById('pauseIcon').style.display = 'block';
  pomoInterval = setInterval(tickPomo, 1000);
}
function pausePomodoro() {
  pomoRunning = false;
  clearInterval(pomoInterval);
  document.getElementById('playIcon').style.display = 'block';
  document.getElementById('pauseIcon').style.display = 'none';
}
function resetPomodoro() {
  pausePomodoro();
  const cfg = POMO_MODES[pomoMode];
  pomoSeconds = cfg.s; pomoTotal = cfg.s;
  updateTimerDisplay();
}
function skipPomodoro() { completePomo(false); }
function tickPomo() {
  pomoSeconds--;
  updateTimerDisplay();
  if (pomoSeconds <= 0) completePomo(true);
}
function completePomo(sound) {
  clearInterval(pomoInterval); pomoRunning = false;
  document.getElementById('playIcon').style.display = 'block';
  document.getElementById('pauseIcon').style.display = 'none';

  if (pomoMode === 'work') {
    const today = getTodayKey();
    const prev = parseInt(localStorage.getItem(`pomo_${today}`) || '0');
    localStorage.setItem(`pomo_${today}`, prev + 1);
    renderSessionDots(); updateDashboardStats();
    showToast('Sesi fokus selesai. Saatnya istirahat.');
    confetti();
    if (sound) pingSound();
  } else {
    showToast('Istirahat selesai. Siap kembali fokus?');
    if (sound) pingSound();
  }
  setPomoMode(
    pomoMode === 'work' ? 'short' : 'work',
    document.querySelectorAll('.pmode')[pomoMode === 'work' ? 1 : 0]
  );
}
function updateTimerDisplay() {
  const m = Math.floor(pomoSeconds / 60);
  const s = pomoSeconds % 60;
  setTxt('pomodoroTime', `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
  setTxt('pomodoroLabel', POMO_MODES[pomoMode].label);

  const C = 2 * Math.PI * 96;
  const progress = pomoSeconds / pomoTotal;
  const offset = C * (1 - progress);
  const ring = document.getElementById('ringProgress');
  if (ring) {
    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = POMO_MODES[pomoMode].color;
  }
}
function renderSessionDots() {
  const c = document.getElementById('sessionDots');
  const today = getTodayKey();
  const count = parseInt(localStorage.getItem(`pomo_${today}`) || '0');
  setTxt('pomoSessionCount', count);
  if (!c) return;
  c.innerHTML = Array.from({ length: Math.min(count, 12) }, () =>
    '<div class="pip"></div>'
  ).join('');
}
function updatePomoTaskSelect() {
  const sel = document.getElementById('pomoTaskSelect');
  if (!sel) return;
  const pending = state.tasks.filter(t => !t.done);
  sel.innerHTML = '<option value="">-- Pilih kegiatan --</option>' +
    pending.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('');
}
function pingSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 660, 880].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  } catch(e) {}
}

// ── JULE AI ──
let juleHistory = [];

async function sendToJule() {
  const inp = document.getElementById('juleInput');
  const btn = document.getElementById('juleSendBtn');
  const msg = inp?.value.trim();
  if (!msg) return;
  inp.value = ''; btn.disabled = true;

  appendMsg(msg, 'user');
  juleHistory.push({ role: 'user', content: msg });
  const typingId = showTyping();

  try {
    const reply = await callJule(juleHistory);
    removeTyping(typingId);
    appendMsg(reply, 'jule');
    juleHistory.push({ role: 'assistant', content: reply });
    if (juleHistory.length > 20) juleHistory = juleHistory.slice(-20);
  } catch(err) {
    removeTyping(typingId);
    const isKeyErr = err.message.includes('401') || err.message.includes('API_KEY');
    appendMsg(isKeyErr
      ? 'API key belum diatur. Tambahkan API key Anthropic di file app.js untuk mengaktifkan Jule sepenuhnya.'
      : 'Maaf, ada gangguan koneksi. Coba lagi ya!', 'jule');
  }
  btn.disabled = false;
}

async function callJule(history) {
  if (ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    return demoReply(history[history.length - 1].content);
  }

  const system = `Kamu adalah Jule, asisten AI yang hangat, empatik, dan supportif di aplikasi Jalanajadulu.com.

Kepribadian Jule:
- Berbicara dalam Bahasa Indonesia yang natural, santai, dan akrab
- Penuh perhatian dan tidak pernah menghakimi
- Memberikan energi positif dan saran praktis yang bisa langsung dilakukan
- Menggunakan bahasa yang manusiawi — tidak kaku seperti robot
- Respons singkat dan padat: 2-4 paragraf maksimal

Konteks aplikasi:
- Ini adalah aplikasi manajemen waktu dan produktivitas
- User mungkin stres dengan pekerjaan, merasa overwhelmed, atau butuh motivasi
- Mood user saat ini: ${state.currentMoodLabel || 'belum diketahui'}
- Total tugas: ${state.tasks.length}, sudah selesai: ${state.tasks.filter(t => t.done).length}

Jangan pakai emoji dalam jawabanmu. Ekspresikan kehangatan lewat pilihan kata.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 500,
      system,
      messages: history
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || 'Maaf, ada gangguan. Coba lagi ya.';
}

function demoReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('stres') || m.includes('capek') || m.includes('lelah') || m.includes('berat'))
    return `Aku dengar kamu, dan aku ingin kamu tahu — perasaan itu sangat wajar.\n\nKetika stres menumpuk, sering kali bukan karena kamu tidak cukup baik, melainkan karena kamu sedang membawa terlalu banyak sekaligus. Coba ambil napas panjang sebentar — empat hitungan masuk, empat tahan, enam keluar.\n\nSetelah itu, kita bisa coba pilah satu tugas terkecil yang bisa dikerjakan sekarang. Hanya satu. Mau cerita lebih lanjut tentang apa yang paling terasa berat?`;

  if (m.includes('motivasi') || m.includes('males') || m.includes('malas') || m.includes('semangat'))
    return `Senang kamu mau jujur soal perasaan itu — itu langkah pertama yang luar biasa.\n\nCoba ini: set timer dua menit saja dan mulai sesuatu, apapun, tanpa tekanan untuk sempurna. Hampir selalu, setelah dua menit, kamu akan terus melanjutkannya karena otak sudah masuk mode kerja.\n\nIngat, kamu tidak harus merasa siap untuk memulai. Mulailah, dan kesiapan itu akan datang sendiri. Apa satu hal paling kecil yang bisa dimulai sekarang?`;

  if (m.includes('produktif') || m.includes('tips') || m.includes('cara'))
    return `Ada beberapa prinsip yang terbukti membantu banyak orang:\n\nPertama, pilih tiga prioritas utama di pagi hari — hanya tiga. Fokuslah pada itu sebelum yang lain. Kedua, gunakan Pomodoro: 25 menit fokus penuh, 5 menit istirahat. Ini sangat membantu menjaga energi sepanjang hari. Ketiga, hindari multitasking — otak manusia jauh lebih efisien saat menyelesaikan satu hal sampai tuntas.\n\nMana yang menurutmu paling relevan untuk situasimu sekarang?`;

  if (m.includes('overwhelmed') || m.includes('banyak') || m.includes('numpuk'))
    return `Aku bisa merasakan betapa beratnya itu. Rasa overwhelmed muncul bukan karena kamu lemah, tapi karena kamu peduli.\n\nCoba satu hal sederhana: ambil kertas dan tulis semua yang ada di kepalamu tanpa filter, keluarkan segalanya. Setelah itu, lihat kembali — biasanya hanya satu atau dua hal yang benar-benar urgent hari ini. Sisanya bisa menunggu.\n\nKamu tidak harus menyelesaikan semuanya sekarang. Satu langkah, satu napas. Aku di sini bersamamu.`;

  return `Terima kasih sudah berbagi denganku. Aku senang kamu di sini.\n\nApapun yang sedang kamu rasakan hari ini — senang, berat, bingung, atau di antaranya — aku siap mendengarkan. Tidak ada cerita yang terlalu kecil atau terlalu besar.\n\nGimana harimu sejauh ini?`;
}

function appendMsg(text, sender) {
  const chat = document.getElementById('juleChatArea');
  if (!chat) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'jule-msg'}`;

  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  div.innerHTML = sender === 'user'
    ? `<div class="chat-body" style="align-items:flex-end">
        <span class="chat-sender" style="text-align:right">Kamu</span>
        <div class="chat-bubble"><p>${formatted}</p></div>
       </div>
       <div class="chat-avatar" style="background:var(--terra-bg)">
         <svg viewBox="0 0 34 34" fill="none" width="34" height="34">
           <circle cx="17" cy="17" r="17" fill="var(--terra-bg)"/>
           <circle cx="17" cy="14" r="6" fill="var(--terracotta)" opacity="0.7"/>
           <path d="M4 32c0-7.2 5.8-13 13-13s13 5.8 13 13" fill="var(--terracotta)" opacity="0.5"/>
         </svg>
       </div>`
    : `<div class="chat-avatar">
         <svg viewBox="0 0 34 34" fill="none" width="34" height="34">
           <circle cx="17" cy="17" r="17" fill="var(--sage-light)"/>
           <circle cx="17" cy="14" r="6" fill="var(--sage)" opacity="0.9"/>
           <path d="M4 32c0-7.2 5.8-13 13-13s13 5.8 13 13" fill="var(--sage)" opacity="0.7"/>
         </svg>
       </div>
       <div class="chat-body">
         <span class="chat-sender">Jule</span>
         <div class="chat-bubble"><p>${formatted}</p></div>
       </div>`;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  const chat = document.getElementById('juleChatArea');
  if (!chat) return null;
  const id = `t-${Date.now()}`;
  const div = document.createElement('div');
  div.className = 'chat-msg jule-msg'; div.id = id;
  div.innerHTML = `
    <div class="chat-avatar">
      <svg viewBox="0 0 34 34" fill="none" width="34" height="34">
        <circle cx="17" cy="17" r="17" fill="var(--sage-light)"/>
        <circle cx="17" cy="14" r="6" fill="var(--sage)" opacity="0.9"/>
        <path d="M4 32c0-7.2 5.8-13 13-13s13 5.8 13 13" fill="var(--sage)" opacity="0.7"/>
      </svg>
    </div>
    <div class="chat-body">
      <span class="chat-sender">Jule</span>
      <div class="chat-bubble typing-bubble">
        <div class="t-dot"></div>
        <div class="t-dot"></div>
        <div class="t-dot"></div>
      </div>
    </div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return id;
}
function removeTyping(id) { if (id) document.getElementById(id)?.remove(); }

function sendQuickPrompt(text) {
  const inp = document.getElementById('juleInput');
  if (inp) { inp.value = text; sendToJule(); }
}
function handleJuleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToJule(); }
}
function clearChat() {
  juleHistory = [];
  const chat = document.getElementById('juleChatArea');
  if (chat) {
    chat.innerHTML = `
      <div class="chat-msg jule-msg">
        <div class="chat-avatar">
          <svg viewBox="0 0 34 34" fill="none" width="34" height="34">
            <circle cx="17" cy="17" r="17" fill="var(--sage-light)"/>
            <circle cx="17" cy="14" r="6" fill="var(--sage)" opacity="0.9"/>
            <path d="M4 32c0-7.2 5.8-13 13-13s13 5.8 13 13" fill="var(--sage)" opacity="0.7"/>
          </svg>
        </div>
        <div class="chat-body">
          <span class="chat-sender">Jule</span>
          <div class="chat-bubble">
            <p>Percakapan dihapus. Aku masih di sini — ceritakan apa yang ada di pikiranmu.</p>
          </div>
        </div>
      </div>`;
  }
}

// ── TOAST ──
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  if (toastTimer) clearTimeout(toastTimer);
  t.textContent = msg; t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── CONFETTI ──
function confetti() {
  const cv = document.getElementById('confettiCanvas');
  if (!cv) return;
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');
  const colors = ['#C8624A','#E08A74','#C8913A','#6B8F71','#5A6A7A','#7A6B9A','#F5E8E3','#EDE8E0'];
  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * cv.width, y: -8,
    r: Math.random() * 5 + 2.5,
    dx: (Math.random() - 0.5) * 3,
    dy: Math.random() * 3 + 1.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1,
  }));
  let frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    particles.forEach(p => {
      ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      p.x += p.dx; p.y += p.dy; p.dy += 0.06; p.alpha -= 0.013;
    });
    if (++frame < 110) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

// ── UTILS ──
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
  catch(e) { return d; }
}

// ── KEYBOARD SHORTCUT ──
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('quickNoteInput')?.focus();
  }
});

// ── SAMPLE DATA (pertama kali buka) ──
window.addEventListener('load', () => {
  if (!state.notes.length && !state.tasks.length) {
    state.notes = [
      {
        id: 1, title: 'Selamat datang di Jalanajadulu',
        content: 'Ini adalah catatan pertamamu. Kamu bisa menulis apa saja di sini — refleksi harian, ide-ide, perasaan, atau hal-hal yang kamu syukuri.',
        mood: 'semangat', category: 'pribadi', createdAt: new Date().toISOString()
      },
      {
        id: 2, title: 'Tips menggunakan aplikasi ini',
        content: 'Gunakan Pomodoro untuk fokus kerja. Ngobrol dengan Jule jika sedang tidak baik-baik saja. Catat refleksi harian untuk melihat pertumbuhanmu.',
        mood: 'biasa', category: 'ide', createdAt: new Date(Date.now() - 86400000).toISOString()
      },
    ];
    state.tasks = [
      { id:1, title:'Coba fitur Pomodoro Timer', desc:'Fokus selama 25 menit lalu istirahat 5 menit', priority:'high', category:'belajar', deadline:'', done:false, createdAt: new Date().toISOString() },
      { id:2, title:'Ngobrol dengan Jule AI', desc:'Tanya tips produktivitas atau cerita tentang harimu', priority:'medium', category:'pribadi', deadline:'', done:false, createdAt: new Date().toISOString() },
      { id:3, title:'Buat catatan harian pertama', desc:'Tulis refleksi atau perasaan hari ini', priority:'low', category:'pribadi', deadline:'', done:true, createdAt: new Date().toISOString() },
    ];
    saveState(); renderNotes(); renderTasks();
    renderQuickTaskList(); updateDashboardStats(); updateProgressBar(); updatePomoTaskSelect();
  }
});