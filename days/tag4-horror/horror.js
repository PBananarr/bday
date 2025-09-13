import { HORROR_CONFIG as CFG } from "./horror_data.js";

// --- LIFECYCLE/TEARDOWN-UTILS ----------------------------------------------
const _timeouts = new Set();
const _intervals = new Set();
const _rafs = new Set();
const _cleanups = [];
const _audios = new Set();     // optionale HTMLAudio-Instanzen hier registrieren

const setT = (fn, ms) => { const id = setTimeout(fn, ms); _timeouts.add(id); return id; };
const setI = (fn, ms) => { const id = setInterval(fn, ms); _intervals.add(id); return id; };
const setR = (fn) => { const id = requestAnimationFrame(fn); _rafs.add(id); return id; };
const on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); _cleanups.push(() => el.removeEventListener(type, fn, opts)); };

function trackAudio(audio) { _audios.add(audio); return audio; }

function _stopAllAudio(audioCtxRef) {
  // HTMLAudio (tag-basiert)
  _audios.forEach(a => { try { a.pause(); a.currentTime = 0; } catch (_) { } });
  _audios.clear();
  // WebAudio (AudioContext)
  const ctx = audioCtxRef?.current;
  if (ctx) {
    if (typeof ctx.close === 'function') { ctx.close().catch(() => ctx.suspend?.()); }
    else if (typeof ctx.suspend === 'function') { ctx.suspend(); }
    audioCtxRef.current = null;
  }
}

function _teardown(extra = () => { }) {
  _timeouts.forEach(clearTimeout); _timeouts.clear();
  _intervals.forEach(clearInterval); _intervals.clear();
  _rafs.forEach(cancelAnimationFrame); _rafs.clear();
  _cleanups.forEach(fn => { try { fn(); } catch (_) { } }); _cleanups.length = 0;
  extra();
}


// ============================================================================

export function build(host, api) {
  host.innerHTML = `<canvas id="blood-canvas" aria-hidden="true"></canvas>

  <div id="age-gate" class="overlay" role="dialog" aria-modal="true" aria-labelledby="age-title">
    <div class="overlay__panel">
      <h1 id="age-title">🩸 Prophezeiung der Verbotenen Gasse 🩸</h1>
      <p class="prophecy">
        Vier Flüche binden dich an diesen Ort,<br>
        gebannt in Dingen, verborgen dort.<br>
        Hinter Symbolen, hinter Türen,<br>
        musst du sie mit Mut erspüren.<br><br>

        Drücke Tasten – doch sei gewarnt,<br>
        manches Spiel ist höllisch, nicht gebannt.<br>
        Nur wer hört, erkennt den Sinn,<br>
        der Klang weist dir den rechten Gewinn.<br><br>

        Schalte laut, verbanne Ruh’,<br>
        sonst schweigt der Fluch und bleibt im Nu.<br>
        Findest du die vier im Bann,<br>
        so endet, was nicht enden kann.
      </p>
      <div class="overlay__actions">
        <button id="age-enter" class="btn btn--red" type="button">Ich bin 18+ und will rein</button>
        <button id="age-exit" class="btn btn--ghost" type="button">Ich hab die Hosen voll und Hau ab</button>
      </div>
    </div>
  </div>

  <main id="app" class="hidden">
    <header class="top">
      <div class="brand">
        <h1 class="logo">Verbotene&nbsp;Gasse</h1>
        <p class="tag">…du hättest nicht herkommen sollen.</p>
      </div>

      <div class="controls">
        <button id="toggle-blood" class="switch" aria-pressed="false" title="Blutregen umschalten">
          <span class="switch__label">Blut</span>
          <span class="switch__thumb" data-on="AN" data-off="AUS">AUS</span>
        </button>

        <div class="found-counter" aria-live="polite" aria-atomic="true">
          <span class="found-label" aria-hidden="true">FINDE&nbsp;UNS:</span>
          <span id="found-counter">0/4</span>
        </div>
      </div>
    </header>

    <section class="tiles" aria-label="Rituale & Spielereien">
      <button class="tile tile--summon" data-action="summon">
        <span class="tile__title">Beschwöre</span>
        <span class="tile__sub">Was immer antwortet.</span>
      </button>

      <button class="tile tile--dont" data-action="dont">
        <span class="tile__title">NICHT DRÜCKEN</span>
        <span class="tile__sub">…ernsthaft, lass es.</span>
      </button>

      <button class="tile tile--whisper" data-action="whisper">
        <span class="tile__title">Flüstern</span>
        <span class="tile__sub">Hörst du es auch?</span>
      </button>

      <button class="tile tile--candles" data-action="candles">
        <span class="tile__title">Kerzen</span>
        <span class="tile__sub">Flackerndes Licht</span>
      </button>

      <button class="tile tile--runes" data-action="runes">
        <span class="tile__title">Runen</span>
        <span class="tile__sub">✠ ☿ ⛧ ᚠ ᚱ ᛟ</span>
      </button>

      <button class="tile tile--door" data-action="door">
        <span class="tile__title">Tür</span>
        <span class="tile__sub">Klopf, klopf.</span>
      </button>

      <button class="tile tile--blood" data-action="blood">
        <span class="tile__title">Blutregen</span>
        <span class="tile__sub">Lass es tropfen…</span>
      </button>

      <button class="tile tile--eyes" data-action="eyes">
        <span class="tile__title">Sieh mich an</span>
        <span class="tile__sub">Sie sehen alles.</span>
      </button>

      <button class="tile tile--void" data-action="void">
        <span class="tile__title">Die Leere</span>
        <span class="tile__sub">Blicke hinein.</span>
      </button>

      <button class="tile tile--roulette" data-action="roulette">
        <span class="tile__title">Scare-Roulette</span>
        <span class="tile__sub">Zufälliger Jumpscare</span>
      </button>
    </section>
  </main>

  <div id="screamer" class="screamer" aria-hidden="true"></div>`;

  (function () {
    // ======= UTIL =======
    const $ = (sel, el = document) => el.querySelector(sel);
    const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
    const APP = document.getElementById('app');
    const rnd = (n = 1) => Math.random() * n;

    // Track state
    const state = {
      scares: true,
      blood: false,
      scaryTimer: null,
      bloodAnim: null,
      audioCtx: null,
      masterGain: null,
      whisperNode: null,
    };

    const audioCtxRef = { current: null }; // für WebAudio-Cleanup

    // --- Globaler Cooldown ---
    let globalLockUntil = 0;
    const GLOBAL_COOLDOWN_MS = 2000;

    function isGloballyLocked() {
      return performance.now() < globalLockUntil;
    }

    function startGlobalCooldown(ms = GLOBAL_COOLDOWN_MS) {
      globalLockUntil = performance.now() + ms;
      APP.classList.add('is-locked');
      APP.setAttribute('aria-busy', 'true');
      window.clearTimeout(startGlobalCooldown._tid);
      startGlobalCooldown._tid = setT(() => {
        APP.classList.remove('is-locked');
        APP.removeAttribute('aria-busy');
      }, ms);
    }

    // ---- Config aus horror_data.js einlesen ----
    state.scares = true;
    state.blood = CFG.DEFAULT_BLOOD ?? state.blood;

    // === Hidden Objects ===
    const ITEMS = CFG.ITEMS || [];
    let placement = {}; // { slotIndex: itemKey }
    let foundSet = new Set();

    let completionShown = false;

    function showCompletionPopup() {
      // Unser eigenes Abschlussbild aus picHorror
      const imgSrc = CFG.withV(CFG.IMG_BASE + 'gefunden.png');
      const title = '🩸 Verrückt';
      const caption = 'Du bist endlich frei und erhältst diesen Badge: " 🩸 Verrückt "';

      // Badge-Popup anzeigen
      lightbox.open(imgSrc, title, caption);
    }


    function updateFoundCounter() {
      const el = $('#found-counter');
      if (!el) return;
      el.textContent = `${foundSet.size}/${ITEMS.length}`;
    }

    function randomizePlacement() {
      const tiles = $$('.tiles .tile');
      const idxs = tiles.map((_, i) => i);
      for (let i = idxs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
      }
      const count = Math.min(ITEMS.length, tiles.length);
      placement = {};
      for (let n = 0; n < count; n++) {
        placement[String(idxs[n])] = ITEMS[n].key;
      }
    }

    function itemByKey(key) { return ITEMS.find(i => i.key === key); }

    function revealItem(tile, itemKey) {
      const it = itemByKey(itemKey);
      if (!it) return;

      tile.classList.add('tile--flipped');

      const card = document.createElement('div');
      card.className = 'item-card';

      const img = new Image();
      img.src = it.img;
      img.alt = it.name;
      img.className = 'item-card__img';

      const label = document.createElement('div');
      label.className = 'item-card__name';
      label.innerHTML = `Du hast <strong>${it.name}</strong> gefunden.`;

      card.appendChild(img);
      card.appendChild(label);
      tile.appendChild(card);

      // Lightbox für das gefundene Item
      // Merke dir, ob dieser Fund die Sammlung voll macht
      const willBeComplete = !foundSet.has(itemKey) && (foundSet.size + 1) === ITEMS.length;

      lightbox.open(
        it.img,
        it.name,
        `Du hast den Fluchgegenstand ${it.name} gefunden.`,
        () => {
          // erst nach dem Schließen der Item-Lightbox
          startGlobalCooldown();

          // Wenn jetzt alle Items gefunden sind: Badge-Popup einmalig zeigen
          if (willBeComplete && !completionShown) {
            completionShown = true;
            setT(() => showCompletionPopup(), 120);  // kleiner Delay für smoothness
          }
        }
      );

      // Zähler nur einmal pro Item erhöhen
      if (!foundSet.has(itemKey)) {
        foundSet.add(itemKey);
        updateFoundCounter();
      }


      if (!foundSet.has(itemKey)) {
        foundSet.add(itemKey);
        updateFoundCounter();
      }

      card.addEventListener('click', (e) => {
        if (e.target === img) {
          e.stopPropagation();
          tile.classList.remove('tile--flipped');
          tile.classList.add('tile--found');
          card.remove();
        }
      }, { passive: true });
    }

    function initHiddenObjects() {
      $$('.tiles .tile').forEach((t, idx) => t.dataset.slot = String(idx));
      randomizePlacement();
      foundSet = new Set();
      updateFoundCounter();
    }

    // Unlock Audio on first user gesture
    function ensureAudio() {
      if (!state.audioCtx) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.gain.value = 0.8;
        gain.connect(ctx.destination);
        state.audioCtx = ctx;
        state.masterGain = gain;
        audioCtxRef.current = ctx; // <— für Teardown
      }
    }

    // ======= AGE GATE =======
    const ageGate = $('#age-gate');
    const ageEnterBtn = $('#age-enter');
    const ageExitBtn = $('#age-exit');

    let gateOpened = false;

    function openGate(e) {
      e?.preventDefault?.();
      if (gateOpened) return;
      gateOpened = true;

      try { ensureAudio(); } catch (_) { }
      ageGate.remove();
      $('#app').classList.remove('hidden');
      scheduleRandomScare();
    }

    const EXIT_URL = CFG.AGE_EXIT_URL ?? 'https://pbananarr.github.io/bday/';

    function leaveGate(e) {
      e?.preventDefault?.();
      location.href = EXIT_URL;
    }

    if (ageEnterBtn) {
      ['click', 'pointerup', 'touchend', 'keydown'].forEach(ev => {
        on(ageEnterBtn, ev, (e) => {
          if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
          openGate(e);
        }, { passive: false });
      });
    }

    if (ageExitBtn) {
      ['click', 'pointerup', 'touchend', 'keydown'].forEach(ev => {
        on(ageExitBtn, ev, (e) => {
          if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
          leaveGate(e);
        }, { passive: false });
      });
    }

    // ======= SCARE OVERLAY & VARIANTS =======
    const overlay = $('#screamer');
    function showOverlay(node) {
      overlay.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'content';
      wrap.appendChild(node);
      overlay.appendChild(wrap);
      overlay.classList.add('visible', 'flash');
      APP.classList.add('shake');
      setT(() => overlay.classList.remove('flash'), 500);
    }
    function hideOverlay(after = 900) {
      setT(() => {
        overlay.classList.remove('visible');
        APP.classList.remove('shake');
        overlay.innerHTML = '';
      }, after);
    }

    // ======= LIGHTBOX (Fullscreen Bildanzeige) =======
    const lightbox = (() => {
      const el = document.createElement('div');
      el.id = 'lightbox';
      el.className = 'lightbox';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `
        <button class="lightbox__close" aria-label="Schließen">×</button>
        <div class="lightbox__content">
          <img class="lightbox__img" alt="">
          <div class="lightbox__caption" role="status" aria-live="polite"></div>
        </div>
      `;
      document.body.appendChild(el);

      const img = el.querySelector('.lightbox__img');
      const btn = el.querySelector('.lightbox__close');
      const cap = el.querySelector('.lightbox__caption');

      let onCloseCb = null;

      const close = () => {
        el.classList.remove('visible');
        el.setAttribute('aria-hidden', 'true');
        img.src = '';
        img.alt = '';
        cap.textContent = '';
        if (typeof onCloseCb === 'function') {
          const cb = onCloseCb; onCloseCb = null; cb();
        }
      };

      const open = (src, alt = '', caption = '', onClose) => {
        img.src = src;
        img.alt = alt;
        cap.textContent = caption;
        el.classList.add('visible');
        el.setAttribute('aria-hidden', 'false');
        onCloseCb = typeof onClose === 'function' ? onClose : null;
      };

      on(btn, 'click', close);
      on(el, 'click', (e) => { if (e.target === el) close(); });
      on(document, 'keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('visible')) close(); });

      // Beim Verlassen des Tags DOM-Node entsorgen
      _cleanups.push(() => { try { el.remove(); } catch (_) { } });
      return { open, close };
    })();

    // Visual variants
    const visuals = {
      face() {
        const face = document.createElement('div');
        face.className = 'face';
        face.innerHTML = '<div class="eye left"></div><div class="eye right"></div><div class="mouth"></div>';
        return { node: face, duration: 900 };
      },
      shadow() {
        const el = document.createElement('div');
        el.className = 'shadow';
        return { node: el, duration: 800 };
      },
      text() {
        const t = document.createElement('div');
        t.className = 'textshock';
        t.textContent = Math.random() < .5 ? 'HINTER DIR' : 'LAUF';
        return { node: t, duration: 700 };
      },
      tv() {
        const tv = document.createElement('div');
        tv.className = 'tv';
        tv.innerHTML = '<div class="noise"></div><div class="scanlines"></div>';
        return { node: tv, duration: 700 };
      },
    };

    // Audio variants
    function makeDistortionCurve(amount) {
      const n = 44100, curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = i * 2 / n - 1;
        curve[i] = (3 + amount) * x * 20 * Math.PI / 180 / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }

    function audioScreech(intensity = 1) {
      ensureAudio();
      const ctx = state.audioCtx;
      const now = ctx.currentTime;

      // noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1) * 0.6; }
      const noise = ctx.createBufferSource(); noise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass'; bandpass.frequency.value = 1200 + Math.random() * 2000; bandpass.Q.value = 0.8;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.8 * intensity, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(bandpass).connect(noiseGain).connect(state.masterGain);
      noise.start();

      const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'triangle';
      o1.frequency.setValueAtTime(240, now); o2.frequency.setValueAtTime(120, now);
      o1.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      o2.frequency.exponentialRampToValueAtTime(60, now + 0.6);

      const dist = ctx.createWaveShaper(); dist.curve = makeDistortionCurve(600); dist.oversample = '4x';
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.9 * intensity, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      o1.connect(dist); o2.connect(dist);
      dist.connect(g).connect(state.masterGain);
      o1.start(); o2.start();
      o1.stop(now + 0.7); o2.stop(now + 0.7);
    }

    function audioBassDrop() {
      ensureAudio();
      const ctx = state.audioCtx;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(200, now);
      o.frequency.exponentialRampToValueAtTime(35, now + 0.6);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.6, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      o.connect(f).connect(g).connect(state.masterGain);
      o.start(); o.stop(now + 0.7);
    }

    function audioMetalScrape() {
      ensureAudio();
      const ctx = state.audioCtx;
      const now = ctx.currentTime;
      const carrier = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const dist = ctx.createWaveShaper(); dist.curve = makeDistortionCurve(1000);
      carrier.type = 'square'; mod.type = 'sawtooth';
      carrier.frequency.value = 140;
      mod.frequency.value = 60;
      modGain.gain.value = 90;
      mod.connect(modGain);
      modGain.connect(carrier.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      carrier.connect(dist).connect(g).connect(state.masterGain);
      carrier.start(); mod.start();
      carrier.stop(now + 0.6); mod.stop(now + 0.6);
    }

    function audioStaticBurst() {
      ensureAudio();
      const ctx = state.audioCtx;
      const now = ctx.currentTime;
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1); }
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.7, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      src.connect(hp).connect(g).connect(state.masterGain);
      src.start(); src.stop(now + 0.3);
    }

    const visualVariants = ['face', 'shadow', 'text', 'tv'];
    const audioVariants = [audioScreech, audioBassDrop, audioMetalScrape, audioStaticBurst];

    function triggerJumpscare(reason = '') {
      if (!state.scares) return;
      const v = visualVariants[Math.floor(Math.random() * visualVariants.length)];
      const { node, duration } = visuals[v]();
      const a = audioVariants[Math.floor(Math.random() * audioVariants.length)];
      a();
      showOverlay(node);
      hideOverlay(duration);
    }

    // Random Scares
    function scheduleRandomScare() {
      // nicht mehr clearTimeout(state.scaryTimer) nötig, wir tracken selbst
      if (!state.scares) return;
      const min = CFG.RANDOM_SCARE_MIN_MS ?? 8000;
      const max = CFG.RANDOM_SCARE_MAX_MS ?? 22000;
      const next = min + Math.random() * (max - min);
      state.scaryTimer = setT(() => {
        triggerJumpscare('random');
        scheduleRandomScare();
      }, next);
    }

    // ======= BLOOD =======
    const canvas = $('#blood-canvas');
    const ctx2 = canvas.getContext('2d', { alpha: true });
    let drops = [];
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      canvas.width = w; canvas.height = h;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    on(window, 'resize', resizeCanvas);
    resizeCanvas();

    function spawnDrop(x, y) {
      const size = 4 + Math.random() * 10;
      const speed = 1 + Math.random() * 2.5;
      drops.push({ x, y, size, speed, alive: true });
    }

    function drawBlood() {
      ctx2.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of drops) {
        if (!d.alive) continue;
        ctx2.beginPath();
        ctx2.fillStyle = 'rgba(210, 0, 0, 0.95)';
        ctx2.arc(d.x, d.y, d.size * 0.6, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.beginPath();
        ctx2.strokeStyle = 'rgba(160, 0, 0, 0.8)';
        ctx2.lineWidth = Math.max(1, d.size * 0.25);
        ctx2.moveTo(d.x, d.y);
        ctx2.lineTo(d.x, d.y - d.size * 1.8);
        ctx2.stroke();
        d.y += d.speed + d.size * 0.1;
        if (d.y > window.innerHeight - 2) {
          d.alive = false;
          ctx2.beginPath();
          ctx2.fillStyle = 'rgba(120, 0, 0, 0.7)';
          ctx2.ellipse(d.x, window.innerHeight - 2, d.size * 2.2, d.size * 0.9, 0, 0, Math.PI * 2);
          ctx2.fill();
        }
      }
      drops = drops.filter(d => d.alive);
    }

    function tickBlood() {
      if (!state.blood) return;
      if (Math.random() < .6) {
        const x = Math.random() * window.innerWidth;
        spawnDrop(x, -10);
      }
      drawBlood();
      state.bloodAnim = setR(tickBlood);
    }

    function startBlood() {
      if (state.blood) return;
      state.blood = true;
      tickBlood();
    }
    function stopBlood() {
      state.blood = false;
      cancelAnimationFrame(state.bloodAnim);
      ctx2.clearRect(0, 0, canvas.width, canvas.height);
      drops = [];
    }

    // ======= TILES =======
    function attachTiles() {
      $$('.tiles .tile').forEach((tile, idx) => {
        tile.dataset.slot = String(idx);

        tile.addEventListener('pointermove', (e) => {
          const r = tile.getBoundingClientRect();
          tile.style.setProperty('--_mx', (e.clientX - r.left) + 'px');
          tile.style.setProperty('--_my', (e.clientY - r.top) + 'px');
        });

        tile.addEventListener('click', () => {
          if (isGloballyLocked()) return;
          if (tile.classList.contains('tile--flipped')) return;

          const slot = tile.dataset.slot;
          const itemKey = placement[slot];
          if (itemKey && !tile.classList.contains('tile--found')) {
            revealItem(tile, itemKey);
            return;
          }

          startGlobalCooldown();

          const action = tile.dataset.action;
          switch (action) {
            case 'summon':
              playChord([80, 140, 220], .7);
              setT(() => triggerJumpscare('summon'), 550);
              break;
            case 'dont':
              if (Math.random() < .5) triggerJumpscare('dont');
              else glitchText(tile);
              break;
            case 'whisper':
              whisper();
              break;
            case 'candles':
              document.body.classList.toggle('flicker');
              break;
            case 'runes':
              runes(tile);
              break;
            case 'door':
              knock();
              break;
            case 'blood':
              state.blood ? stopBlood() : startBlood();
              updateToggles();
              break;
            case 'eyes':
              eyes();
              break;
            case 'void':
              stareIntoVoid();
              break;
            case 'roulette':
              triggerJumpscare('roulette');
              break;
          }
        });

        if (tile.dataset.action === 'eyes') {
          tile.addEventListener('mouseenter', () => {
            if (Math.random() < .25) triggerJumpscare('eyes');
          });
        }
      });
    }

    function glitchText(tile) {
      const el = tile.querySelector('.tile__title');
      el.classList.add('glitch');
      setT(() => el.classList.remove('glitch'), 1200);
    }

    let doorKnocks = 0;
    function knock() {
      doorKnocks++;
      thump(doorKnocks);
      if (doorKnocks % 3 === 0) {
        triggerJumpscare('door');
      }
    }

    function whisper() {
      ensureAudio();
      if (state.whisperNode) {
        state.whisperNode.stop();
        state.whisperNode.disconnect();
        state.whisperNode = null;
        return;
      }
      const ctx = state.audioCtx;
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = b0 + b1 + b2 + white * 0.1848;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer; src.loop = true;

      const panner = new StereoPannerNode(ctx, { pan: -1 });
      const gain = ctx.createGain(); gain.gain.value = 0.05;
      src.connect(panner).connect(gain).connect(state.masterGain);
      src.start();
      state.whisperNode = src;

      let t = 0;
      const panInt = setI(() => {
        if (!state.whisperNode) return; // wird automatisch gecleart im Teardown
        t += 0.05;
        panner.pan.value = Math.sin(t) * 0.8;
      }, 100);
    }

    function eyes() {
      playChord([45, 60], .4);
      overlay.style.background = 'radial-gradient(40% 40% at 50% 50%, rgba(0,0,0,.0), rgba(0,0,0,.97))';
      overlay.classList.add('visible');
      hideOverlay(300);
      setT(() => overlay.style.background = '', 350);
    }

    function stareIntoVoid() {
      document.startViewTransition?.(() => {
        document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
        setT(() => document.documentElement.style.filter = '', 600);
      }) ?? triggerJumpscare('void');
    }

    function runes(tile) {
      const sub = tile.querySelector('.tile__sub');
      const msg = 'ER WARTET HINTER DIR';
      let i = 0;
      const id = setI(() => {
        sub.textContent = msg.slice(0, i) + Array.from({ length: msg.length - i }).map(() => '▮▯▰▱▢▣▤▥▦▧▨▩'[Math.floor(Math.random() * 12)]).join('');
        if (++i > msg.length) { clearInterval(id); setT(() => triggerJumpscare('runes'), 800); }
      }, 40);
    }

    function thump(level = 1) {
      ensureAudio();
      const ctx = state.audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      const now = ctx.currentTime;
      o.frequency.setValueAtTime(120, now);
      o.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.6 * Math.min(level / 3, 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      o.connect(g).connect(state.masterGain); o.start(); o.stop(now + 0.36);
    }

    function playChord(freqs = [220, 330, 440], dur = 0.6) {
      ensureAudio();
      const ctx = state.audioCtx;
      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      g.connect(state.masterGain);
      freqs.forEach(f => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = f;
        o.connect(g); o.start(); o.stop(now + dur);
      });
    }

    // ======= TOGGLES & PANIC =======
    function updateToggles() {
      const b = $('#toggle-blood');
      if (!b) return;
      b.setAttribute('aria-pressed', String(state.blood));
      const t = b.querySelector('.switch__thumb');
      if (t) t.textContent = state.blood ? 'AN' : 'AUS';
    }

    const btnBlood = $('#toggle-blood');
    if (btnBlood) {
      btnBlood.addEventListener('click', () => {
        state.blood ? stopBlood() : startBlood();
        updateToggles();
      });
    }

    // ======= INIT =======
    attachTiles();
    initHiddenObjects();
    updateToggles();

    on(document, 'visibilitychange', () => {
      if (state.audioCtx && state.audioCtx.state === 'suspended') { state.audioCtx.resume(); }
    });

    console.log('%cNicht hinschauen…', 'color:#fff;background:#900;padding:6px;border-radius:4px');

    // Patch completion to call api.solved once
    if (typeof updateFoundCounter === 'function') {
      const _origUpdateCounter = updateFoundCounter;
      let _solvedFired = false;
      updateFoundCounter = function () {
        _origUpdateCounter();
        try {
          const el = document.getElementById('found-counter');
          const total = (CFG.ITEMS || []).length;
          const current = el ? parseInt(String(el.textContent).split('/')[0], 10) : NaN;
          if (!_solvedFired && !isNaN(current) && current >= total && total > 0) {
            _solvedFired = true;
            if (api && typeof api.solved === 'function') api.solved();
          }
        } catch (e) { }
      };
    }

    // Expose a cleanup to outer scope
    host._tag4_cleanup = () => {
      // lokales Stoppen von Whisper, Blood usw.
      if (state.whisperNode) { try { state.whisperNode.stop(); } catch (_) { } state.whisperNode = null; }
      state.blood = false;
      document.body.classList.remove('flicker');
      _stopAllAudio(audioCtxRef);

      const lb = document.getElementById('lightbox');
      if (lb) { try { lb.remove(); } catch (_) { } }
    };

  })();

  // Rückgabe: globaler Teardown wenn Tag verlassen wird
  return () => {
    const extra = host._tag4_cleanup || (() => { });
    _teardown(extra);
  };
}
