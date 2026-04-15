// ─── Storage wrapper — chrome.storage.local ───────────────────────────
// All methods are async. Data shape: { [YYYY-MM-DD]: { tasks: [...] } }

const STORAGE_KEY = 'daily_tasks_v1';
const LANG_KEY    = 'daily_schedule_lang';

async function loadAll() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {};
}

async function saveAll(data) {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

async function getDayData(key) {
  const all = await loadAll();
  return all[key] || { tasks: [] };
}

async function saveDayData(key, data) {
  const all = await loadAll();
  all[key] = data;
  await saveAll(all);
}

async function getLang() {
  const result = await chrome.storage.local.get(LANG_KEY);
  return result[LANG_KEY] || 'en';
}

async function setLangPref(code) {
  await chrome.storage.local.set({ [LANG_KEY]: code });
}
