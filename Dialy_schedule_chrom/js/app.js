// ─── Constants ────────────────────────────────────────────────────────
const PRIO       = { high: 0, mid: 1, low: 2 };
const PRIO_CLASS = { high: 'p-high', mid: 'p-mid', low: 'p-low' };

// ─── State ────────────────────────────────────────────────────────────
let currentOffset = 0;
let sortMode      = 'default'; // 'default' | 'priority' | 'time'
let historyOpen   = false;
let currentLang   = 'en';
let langMenuOpen  = false;

const t = () => LANGS[currentLang];

// ─── Date helpers ─────────────────────────────────────────────────────
function getDateKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const wd = t().weekdays[date.getDay()];
  return t().formatDate(y, m, d, wd);
}

// ─── Language menu ────────────────────────────────────────────────────
function buildLangMenu() {
  const dropdown = document.getElementById('langDropdown');
  dropdown.innerHTML = Object.entries(LANGS).map(([code, l]) => `
    <div class="lang-option ${code === currentLang ? 'active' : ''}"
         data-lang="${code}">
      <span class="flag">${l.flag}</span>
      <span>${l.name}</span>
    </div>`).join('');

  dropdown.querySelectorAll('.lang-option').forEach(el => {
    el.addEventListener('click', () => setLang(el.dataset.lang));
  });
}

function toggleLangMenu() {
  langMenuOpen = !langMenuOpen;
  document.getElementById('langBtn').classList.toggle('open', langMenuOpen);
  document.getElementById('langDropdown').classList.toggle('open', langMenuOpen);
}

async function setLang(code) {
  currentLang = code;
  await setLangPref(code);
  langMenuOpen = false;
  document.getElementById('langBtn').classList.remove('open');
  document.getElementById('langDropdown').classList.remove('open');
  document.documentElement.lang = code;
  buildLangMenu();
  applyStaticText();
  await render();
}

document.addEventListener('click', e => {
  if (langMenuOpen && !document.getElementById('langSwitcher').contains(e.target)) {
    langMenuOpen = false;
    document.getElementById('langBtn').classList.remove('open');
    document.getElementById('langDropdown').classList.remove('open');
  }
});

function applyStaticText() {
  const L = t();
  document.getElementById('appTitle').textContent         = L.appTitle;
  document.getElementById('langFlag').textContent         = L.flag;
  document.getElementById('langName').textContent         = L.name;
  document.getElementById('labelTotal').textContent       = L.total;
  document.getElementById('labelDone').textContent        = L.done;
  document.getElementById('taskInput').placeholder        = L.placeholder;
  document.getElementById('addBtn').textContent           = L.addBtn;
  document.getElementById('copyYesterdayBtn').textContent = L.copyYesterday;
  document.getElementById('historyTitle').textContent     = L.historyTitle;
  document.title = L.appTitle;

  const sel = document.getElementById('prioritySelect');
  const cur = sel.value || 'mid';
  sel.innerHTML = `
    <option value="high">${L.high}</option>
    <option value="mid">${L.mid}</option>
    <option value="low">${L.low}</option>`;
  sel.value = cur;
}

// ─── Render ───────────────────────────────────────────────────────────
async function render() {
  const L       = t();
  const key     = getDateKey(currentOffset);
  const isToday = currentOffset === 0;

  // Date
  const { main, sub } = formatDateDisplay(key);
  document.getElementById('dateMain').innerHTML =
    main + (isToday ? `<span class="today-badge">${L.todayBadge}</span>` : '');
  document.getElementById('dateSub').textContent = sub;

  // Nav
  document.getElementById('prevBtn').textContent = L.prev;
  document.getElementById('nextBtn').textContent = L.next;
  document.getElementById('prevBtn').disabled    = false;
  document.getElementById('nextBtn').disabled    = currentOffset >= 0;

  // Add area
  document.getElementById('addArea').style.display = isToday ? 'block' : 'none';

  // List label
  document.getElementById('listLabel').textContent =
    isToday ? L.todayTasks : L.tasksFor(main);

  // Sort hint
  document.getElementById('sortHint').textContent =
    { default: L.sortPriority, priority: L.sortTime, time: L.sortDefault }[sortMode];

  // Tasks
  const data  = await getDayData(key);
  let tasks   = [...data.tasks];
  if (sortMode === 'priority') {
    tasks.sort((a, b) => (PRIO[a.priority] ?? 1) - (PRIO[b.priority] ?? 1));
  } else if (sortMode === 'time') {
    tasks.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }

  // Progress
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total ? Math.round(done / total * 100) : 0;
  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statDone').textContent      = done;
  document.getElementById('progressBar').style.width   = pct + '%';
  document.getElementById('progressPct').textContent   = pct + '%';

  // Task list
  const ul = document.getElementById('taskList');
  ul.innerHTML = '';
  if (tasks.length === 0) {
    ul.innerHTML = `<li class="empty-state">
      <div class="emoji">${isToday ? '✨' : '📭'}</div>
      <p>${isToday ? L.emptyToday : L.emptyPast}</p>
    </li>`;
  } else {
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      const pClass = PRIO_CLASS[task.priority] || 'p-mid';
      li.innerHTML = `
        <div class="task-check ${task.done ? 'checked' : ''}"></div>
        <div class="priority-dot ${pClass}"
             title="${L.prioLabel[task.priority] || L.prioLabel.mid}"></div>
        <span class="task-text ${task.done ? 'done' : ''}">${escHtml(task.text)}</span>
        <span class="task-time">${task.createdAt || ''}</span>
        ${isToday
          ? `<button class="task-del" data-id="${task.id}"
               title="${L.deleteTitle}">×</button>`
          : ''}`;

      li.querySelector('.task-check').addEventListener('click', () => toggleTask(key, task.id));
      li.querySelector('.task-text').addEventListener('click', () => toggleTask(key, task.id));
      if (isToday) {
        li.querySelector('.task-del').addEventListener('click', () => deleteTask(key, task.id));
      }
      ul.appendChild(li);
    });
  }

  // Copy yesterday button
  const yData   = await getDayData(getDateKey(-1));
  const copyBtn = document.getElementById('copyYesterdayBtn');
  copyBtn.disabled = yData.tasks.filter(t => !t.done).length === 0;

  await renderHistory();
}

async function renderHistory() {
  const L    = t();
  const all  = await loadAll();
  const keys = Object.keys(all)
    .filter(k => k !== getDateKey(0))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30);

  const el = document.getElementById('historyList');
  if (keys.length === 0) {
    el.innerHTML = `<div class="empty-state" style="padding:16px"><p>${L.noHistory}</p></div>`;
    return;
  }
  el.innerHTML = keys.map(key => {
    const tasks = all[key].tasks || [];
    const total = tasks.length;
    const done  = tasks.filter(t => t.done).length;
    const pct   = total ? Math.round(done / total * 100) : 0;
    const rc    = pct >= 80 ? '' : pct >= 50 ? 'mid' : 'low';
    const { main, sub } = formatDateDisplay(key);
    return `<div class="history-item" data-key="${key}">
      <div>
        <div class="history-date">${main}</div>
        <div style="font-size:10px;color:var(--muted)">${sub} · ${L.completed(done, total)}</div>
      </div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:${pct}%"></div></div>
      <div class="history-rate ${rc}">${pct}%</div>
    </div>`;
  }).join('');

  el.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => jumpToDate(el.dataset.key));
  });
}

// ─── Actions ──────────────────────────────────────────────────────────
async function addTask() {
  const input = document.getElementById('taskInput');
  const text  = input.value.trim();
  if (!text) { input.focus(); return; }
  const priority = document.getElementById('prioritySelect').value;
  const key      = getDateKey(0);
  const data     = await getDayData(key);
  data.tasks.push({
    id: Date.now().toString(),
    text, done: false, priority,
    createdAt: new Date().toLocaleTimeString('en-US',
      { hour: '2-digit', minute: '2-digit', hour12: false })
  });
  await saveDayData(key, data);
  input.value = '';
  input.focus();
  await render();
}

async function toggleTask(key, id) {
  const data = await getDayData(key);
  const task = data.tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  await saveDayData(key, data);
  await render();
}

async function deleteTask(key, id) {
  const data = await getDayData(key);
  data.tasks = data.tasks.filter(t => t.id !== id);
  await saveDayData(key, data);
  await render();
}

async function navigate(dir) {
  currentOffset = Math.min(0, currentOffset + dir);
  await render();
}

async function jumpToDate(key) {
  currentOffset = Math.round((new Date(key) - new Date(getDateKey(0))) / 86400000);
  await render();
  document.body.scrollTop = 0;
}

async function toggleSort() {
  sortMode = { default: 'priority', priority: 'time', time: 'default' }[sortMode];
  await render();
}

function toggleHistory() {
  historyOpen = !historyOpen;
  document.getElementById('historyList').classList.toggle('open', historyOpen);
  document.getElementById('historyToggle').classList.toggle('open', historyOpen);
  if (historyOpen) renderHistory();
}

async function copyYesterday() {
  const yKey      = getDateKey(-1);
  const todayKey  = getDateKey(0);
  const yData     = await getDayData(yKey);
  if (!yData.tasks.length) return;
  const todayData = await getDayData(todayKey);
  const now = new Date().toLocaleTimeString('en-US',
    { hour: '2-digit', minute: '2-digit', hour12: false });
  const newTasks = yData.tasks.filter(t => !t.done).map(t => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    text: t.text, done: false, priority: t.priority, createdAt: now
  }));
  todayData.tasks = [...todayData.tasks, ...newTasks];
  await saveDayData(todayKey, todayData);
  await render();
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Event bindings ───────────────────────────────────────────────────
document.getElementById('prevBtn').addEventListener('click', () => navigate(-1));
document.getElementById('nextBtn').addEventListener('click', () => navigate(1));
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
document.getElementById('sortHint').addEventListener('click', toggleSort);
document.getElementById('historyHeader').addEventListener('click', toggleHistory);
document.getElementById('copyYesterdayBtn').addEventListener('click', copyYesterday);
document.getElementById('langBtn').addEventListener('click', e => {
  e.stopPropagation();
  toggleLangMenu();
});

// ─── Init ─────────────────────────────────────────────────────────────
(async () => {
  currentLang = await getLang();
  document.documentElement.lang = currentLang;
  buildLangMenu();
  applyStaticText();
  await render();
})();
