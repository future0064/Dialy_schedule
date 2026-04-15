# Daily Schedule — Release Notes

---

## v1.7 (2026-04-15)
**Chrome Extension — browser popup version**

### New Platform
- Packaged as a Manifest V3 Chrome extension (`Dialy_schedule_chrom/`)
- Click the toolbar icon to open the task manager as a popup (420 × 600px)
- All features from the desktop app are preserved

### Technical Changes vs Desktop App
- `localStorage` → `chrome.storage.local` (async, more reliable, survives browser cache clears)
- Inline `<script>` split into external files (MV3 CSP requirement):
  - `js/i18n.js` — all language strings
  - `js/storage.js` — async read/write wrappers
  - `js/app.js` — all UI logic (fully async/await)
- Event listeners replace inline `onclick` attributes
- Icons auto-generated at 16 / 32 / 48 / 128px from `dialy.png`

### Installation
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `Dialy_schedule_chrom/`

---

## v1.6 (2026-04-15)
**Fix: Language preference now persists across restarts**

### Bug Fix
- **Root cause:** `"port": 0` caused a random port on every launch, making `localStorage` origin (`http://localhost:<random>`) change each run and wiping all stored data
- **Fix:** Set fixed port `17420` so origin is always `http://localhost:17420` — language choice and task data now fully persist between sessions

### File
| File | Size |
|------|------|
| `Daily_schedule_v1.6.exe` | 2.7 MB |

---

## v1.5 (2026-04-15)
**Multi-language support — single codebase, 4 languages**

### New Features
- Language switcher dropdown in top-right corner (flag + name)
- Language preference saved to `localStorage` and restored on next launch
- All UI text, date formats, weekday names, and priority labels update instantly on language switch
- Supported languages:
  | | Language | Date Format Example |
  |--|----------|-------------------|
  | 🇺🇸 | English | April 15, 2026 / Tue |
  | 🇨🇳 | 中文 | 2026年4月15日 / 星期二 |
  | 🇯🇵 | 日本語 | 2026年4月15日 / 火曜日 |
  | 🇰🇷 | 한국어 | 2026년 4월 15일 / 화요일 |

### Architecture
- All strings centralized in a single `LANGS` object — adding a new language requires only one new entry

### File
| File | Size |
|------|------|
| `Daily_schedule_v1.5.exe` | 2.7 MB |

---

## v1.2 (2026-04-15)
**English version**

### Changes
- Full English translation of all UI text
- Date format changed to `April 15, 2026 / Wed`
- Timestamps use `en-US` 24-hour format
- Window title, app ID, binary name updated for English build
- Separate project folder: `Dialy_schedule_eng/`

### File
| File | Size |
|------|------|
| `Daily_schedule_v1.2.exe` | 2.7 MB |

---

## v1.1 (2026-04-15)
**Switched from Electron to Neutralinojs — 27× smaller**

### Changes
- Replaced Electron (system-bundled Chromium) with Neutralinojs (uses OS WebView2)
- NSIS script bundles `*.exe` + `resources.neu` into a single portable file
- `dialy.ico` embedded into both the NSIS wrapper and inner exe via `rcedit`
- Data stored in `%LOCALAPPDATA%\Daily_schedule_v1.x\`

### Size Comparison
| Build | Size |
|-------|------|
| Electron (v1.0) | 70 MB |
| Neutralinojs (v1.1+) | **2.6 MB** |

### File
| File | Size |
|------|------|
| `Daily_schedule_v1.1.exe` | 2.6 MB |

---

## v1.0 (2026-04-15)
**Initial release — Electron, Chinese UI**

### Features
- Daily task list with local `localStorage` persistence
- Navigate forward/backward by day to review history
- Task priority levels: High / Mid / Low (color-coded dots)
- Check off tasks with animated completion ring
- Progress bar showing daily completion percentage
- Copy yesterday's **incomplete** tasks to today
- Sort tasks by: Default order / Priority / Creation time
- History panel showing past 30 days with completion rate mini-bars
- Custom `dialy.ico` app icon

### Tech Stack
- Single `index.html` (HTML + CSS + JS, no dependencies)
- Electron v32 portable wrapper
- Packaged with `electron-builder`

### File
| File | Size |
|------|------|
| `Daily_schedule_v1.0.exe` | 70 MB |
