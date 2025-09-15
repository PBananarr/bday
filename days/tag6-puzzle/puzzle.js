import { PUZZLE_CONFIG } from "./puzzle_data.js";

/* ===== Timer/Cleanup Utilities ===== */
const _cleanups = [];
const _timeouts = new Set();
const _intervals = new Set();
const _rafs = new Set();
const setT = (fn, ms) => { const id = setTimeout(fn, ms); _timeouts.add(id); return id; };
const setI = (fn, ms) => { const id = setInterval(fn, ms); _intervals.add(id); return id; };
const setR = (fn) => { const id = requestAnimationFrame(fn); _rafs.add(id); return id; };

export function build(host, api) {
  host.innerHTML = `
    <div class="day-puzzle">
      <div id="app">
        <header class="toolbar">
          <div class="btnbar" role="toolbar" aria-label="Puzzle-Aktionen">
            <button id="startBtn"   class="btn tool primary"><span class="ic">▶️</span><span>Puzzle starten</span></button>
            <button id="shuffleBtn" class="btn tool"><span class="ic">🔀</span><span>Mischen</span></button>
          </div>
        </header>

        <main id="stageWrapper">
          <div id="stage" class="stage" aria-label="Puzzlebrett" role="application"></div>
        </main>

        <!-- Abschluss -->
        <dialog id="badge-modal" aria-labelledby="badge-title">
          <div class="badge-wrap">
            <div class="badge-hero">
              <img id="badge-img" src="" alt="Badge Bild" />
            </div>
            <h2 id="badge-title" class="badge-title">Herzlichen Glückwunsch,<br>du Saufnase</h2>
            <div class="modal-actions">
              <button class="btn btn-lg" id="badge-close">Weiter</button>
            </div>
          </div>
        </dialog>

        <footer class="footer">
          <small>Zieh die Teile aufs Brett. Tipp & Zieh auf dem Handy.</small>
        </footer>
      </div>
      <div id="rain-global" aria-hidden="true"></div>
    </div>`;

  /* ===== Setup & State ===== */
  const cfg = PUZZLE_CONFIG || {};
  const $ = sel => host.querySelector(sel);

  const stage      = $('#stage');

  const startBtn   = $('#startBtn');
  const shuffleBtn = $('#shuffleBtn');

  // Badge-Modal
  const badgeDlg   = $('#badge-modal');
  const badgeImg   = $('#badge-img');
  const badgeClose = $('#badge-close');

  // Globaler Regen-Layer
  const rainGlobal = $('#rain-global');

  // Bild vorbereiten
  let img = new Image();
  img.src = cfg.imageSrc;
  img.onload = init;
  img.onerror = () => alert('Bild konnte nicht geladen werden. Prüfe den Pfad in puzzle_data.js');

  // State
  let COLS = cfg.cols || 8;
  let ROWS = cfg.rows || 6;
  let tileW = 0, tileH = 0, snapThreshold = 0;
  let pieces = [];
  let placedCount = 0;
  let isPointerCoarse = matchMedia('(pointer:coarse)').matches;
  let isAutoSolving = false;

  /* ===== Init ===== */
  function init() {
    if (cfg.bottleSrc) { const pre = new Image(); pre.src = cfg.bottleSrc; }

    stage.style.aspectRatio = `${img.width}/${img.height}`;
    buildPuzzle(COLS, ROWS);
    bindUI();
  }

  function bindUI() {
    startBtn?.addEventListener('click', enterPuzzleMode);
    shuffleBtn?.addEventListener('click', () => shuffleVisible());
    badgeClose?.addEventListener('click', () => badgeDlg?.close());

    const onResize = () => { recomputeLayout(); shuffleVisible(); };
    window.addEventListener('resize', onResize);
    _cleanups.push(() => window.removeEventListener('resize', onResize));
  }

  /* ===== Puzzle-Vollmodus ===== */
  function enterPuzzleMode() {
    document.body.classList.add('puzzle-active');

    // Falls „Hinweise“ (global) offen ist, schließen
    const about = document.getElementById('about');
    try { if (about?.open) about.close(); } catch {}

    setT(() => stage.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
  }
  function exitPuzzleMode() {
    document.body.classList.remove('puzzle-active');
  }

  /* ===== Puzzle bauen ===== */
  function buildPuzzle(cols, rows) {
    const rect = stage.getBoundingClientRect();
    tileW = rect.width / cols;
    tileH = rect.height / rows;

    stage.style.setProperty('--bg-w', rect.width + 'px');
    stage.style.setProperty('--bg-h', rect.height + 'px');
    stage.style.setProperty('--piece-w', tileW + 'px');
    stage.style.setProperty('--piece-h', tileH + 'px');

    const base = Math.hypot(tileW, tileH) * (cfg.snapToleranceFactor || 0.32);
    snapThreshold = isPointerCoarse ? base * (cfg.mobileSnapBoost || 1.2) : base;

    const total = cols * rows;
    const sides = pickSpawnSides();

    pieces = []; placedCount = 0;
    let created = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'piece outline';
        el.dataset.col = String(c);
        el.dataset.row = String(r);

        el.style.backgroundImage = `url("${img.src}")`;
        el.style.backgroundPosition = `${(-c * tileW)}px ${(-r * tileH)}px`;

        // Zielposition
        el.dataset.tx = (c * tileW).toFixed(2);
        el.dataset.ty = (r * tileH).toFixed(2);

        // Startposition: Hälfte Seite 0, Hälfte Seite 1
        const side = (created < Math.floor(total / 2)) ? sides[0] : sides[1];
        const pos = positionOutside(side, rect, tileW, tileH);
        position(el, pos.x, pos.y);
        created++;

        addDragHandlers(el);
        stage.appendChild(el);
        pieces.push(el);
      }
    }
  }

  /* ===== Layout/Resize anpassen ===== */
  function recomputeLayout() {
    const rect = stage.getBoundingClientRect();
    tileW = rect.width / COLS;
    tileH = rect.height / ROWS;

    stage.style.setProperty('--bg-w', rect.width + 'px');
    stage.style.setProperty('--bg-h', rect.height + 'px');
    stage.style.setProperty('--piece-w', tileW + 'px');
    stage.style.setProperty('--piece-h', tileH + 'px');

    const base = Math.hypot(tileW, tileH) * (cfg.snapToleranceFactor || 0.32);
    snapThreshold = isPointerCoarse ? base * (cfg.mobileSnapBoost || 1.2) : base;

    // Zielkoordinaten & Background-Position je Piece aktualisieren
    for (const el of pieces) {
      const c = parseInt(el.dataset.col, 10);
      const r = parseInt(el.dataset.row, 10);

      el.style.backgroundPosition = `${(-c * tileW)}px ${(-r * tileH)}px`;
      el.dataset.tx = (c * tileW).toFixed(2);
      el.dataset.ty = (r * tileH).toFixed(2);

      // Locks an die neue Zielposition schnappen
      if (el.classList.contains('locked')) {
        position(el, parseFloat(el.dataset.tx), parseFloat(el.dataset.ty));
      }
    }
  }

  /* --- Seitenwahl & Positionierung außerhalb des Boards --- */
  function pickSpawnSides() {
    const r = stage.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const space = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right };
    return (space.top + space.bottom) >= (space.left + space.right)
      ? ['top', 'bottom'] : ['left', 'right'];
  }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function positionOutside(side, rect, w, h) {
    const pad = 8;
    switch (side) {
      case 'top':    return { x: rand(pad, rect.width - w - pad), y: -h - rand(8, 24) };
      case 'bottom': return { x: rand(pad, rect.width - w - pad), y: rect.height + rand(8, 24) };
      case 'left':   return { x: -w - rand(8, 24),                 y: rand(pad, rect.height - h - pad) };
      case 'right':  return { x: rect.width + rand(8, 24),         y: rand(pad, rect.height - h - pad) };
    }
  }

  function shuffleVisible() {
    const rect = stage.getBoundingClientRect();
    const total = pieces.length;
    const half = Math.floor(total / 2);
    const sides = pickSpawnSides();

    pieces.forEach((el, i) => {
      if (el.classList.contains('locked')) return;
      const side = (i < half) ? sides[0] : sides[1];
      const pos = positionOutside(side, rect, tileW, tileH);
      position(el, pos.x, pos.y);
    });
  }

  /* ===== Drag / Drop ===== */
  function addDragHandlers(el) {
    let startX = 0, startY = 0, originX = 0, originY = 0, pointerId = null;

    el.addEventListener('pointerdown', (e) => {
      if (el.classList.contains('locked') || isAutoSolving) return;
      pointerId = e.pointerId;
      el.setPointerCapture(pointerId);
      el.style.zIndex = Date.now().toString();
      el.classList.remove('outline');

      startX = e.clientX; startY = e.clientY;
      const p = getPosition(el); originX = p.x; originY = p.y;
    });

    el.addEventListener('pointermove', (e) => {
      if (pointerId === null) return;
      position(el, originX + (e.clientX - startX), originY + (e.clientY - startY));
    });

    el.addEventListener('pointerup', () => {
      if (pointerId === null) return;
      el.releasePointerCapture(pointerId); pointerId = null;

      const tx = parseFloat(el.dataset.tx);
      const ty = parseFloat(el.dataset.ty);
      const p  = getPosition(el);
      const d  = Math.hypot(tx - p.x, ty - p.y);

      if (d <= snapThreshold) {
        position(el, tx, ty);
        el.classList.add('locked');
        el.style.cursor = 'default';
        placedCount++;
        maybeWin();
      } else {
        el.classList.add('outline');
      }
    });
  }

  function getPosition(el) {
    const t = el.style.transform || 'translate(0px, 0px)';
    const m = /translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/.exec(t);
    return { x: m ? parseFloat(m[1]) : 0, y: m ? parseFloat(m[2]) : 0 };
  }

  function position(el, x, y) {
    el.style.transform = `translate(${x}px, ${y}px)`;
  }


  /* ===== Gewinn: Badge + Regen ===== */
  function maybeWin() {
    if (placedCount !== pieces.length) return;

    openBadgeModal();
    try { api && api.solved && api.solved(); } catch (_) {}

    // sobald die Abschlussanimation getriggert wird, die Topbar/Foot wieder zeigen
    exitPuzzleMode();

    // Mini-Delay, damit der Dialog sichtbar ist, bevor Regen startet
    setT(() => { rainBottles(cfg.bottleCount || 40); }, 150);
  }

  function openBadgeModal() {
    if (badgeImg) {
      badgeImg.src = 'days/tag6-puzzle/picPuzzle/weinUndGlas.png';
      badgeImg.onerror = () => { badgeImg.alt = 'Badge Bild (picPuzzle/weinUndGlas.png nicht gefunden)'; };
    }
    if (badgeDlg && !badgeDlg.open) badgeDlg.showModal();
  }

  /* ===== Flaschenregen (globaler Layer) ===== */
  function rainBottles(count) {
    const durMin = 5, durMax = 9;
    const container = rainGlobal || document.body;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('img');
      el.className = 'bottle';

      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDuration = (Math.random() * (durMax - durMin) + durMin) + 's';
      el.style.animationDelay = (Math.random() * 2) + 's';

      const scale = (0.85 + Math.random() * 0.5).toFixed(2);
      const mirror = Math.random() < 0.5 ? -1 : 1;
      el.style.setProperty('--sx', scale);
      el.style.setProperty('--mirror', mirror);

      if (cfg.bottleSrc) {
        el.src = cfg.bottleSrc;
      } else {
        const svg = encodeURIComponent(`
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 192'>
            <defs>
              <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0' stop-color='#f7f7f2'/><stop offset='1' stop-color='#e2e2dc'/>
              </linearGradient>
              <linearGradient id='wine' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0' stop-color='#fff59d'/><stop offset='1' stop-color='#ffe082'/>
              </linearGradient>
            </defs>
            <rect x='24' y='10' width='16' height='28' rx='4' fill='#c8c8c8'/>
            <rect x='18' y='36' width='28' height='130' rx='14' fill='url(#g)' stroke='#b6b6b1' stroke-width='2'/>
            <rect x='20' y='110' width='24' height='52' rx='10' fill='url(#wine)'/>
            <rect x='24' y='4' width='16' height='10' rx='3' fill='#6b6b6b'/>
          </svg>`);
        el.src = `data:image/svg+xml;charset=utf-8,${svg}`;
      }

      container.appendChild(el);
      const total = parseFloat(getComputedStyle(el).animationDuration) * 1000 + 3000;
      setT(() => el.remove(), total);
    }
  }

  /* ===== Cleanup ===== */
  return () => {
    exitPuzzleMode(); // falls Nutzer Tag wechselt, Header/Fuß wieder einblenden
    _cleanups.forEach(fn => { try { fn(); } catch (_) {} }); _cleanups.length = 0;
    _timeouts.forEach(clearTimeout); _timeouts.clear();
    _intervals.forEach(clearInterval); _intervals.clear();
    _rafs.forEach(cancelAnimationFrame); _rafs.clear();
    try { const d = host.querySelector('#badge-modal'); d && d.open && d.close(); } catch (_) {}
  };
}
