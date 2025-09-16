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
      // --- NEU: Pausen-Flags für Lightbox/Trials ---
      pausedByLightbox: false,
      wasScares: null,
      wasWhispering: false,
      // Trials
      fails: 0,
      boundItems: new Set(), // „gebunden“ nach bestandener Prüfung
    };

    const audioCtxRef = { current: null }; // für WebAudio-Cleanup


    // ---- Config aus horror_data.js einlesen ----
    state.scares = true;
    state.blood = CFG.DEFAULT_BLOOD ?? state.blood;

    // === Hidden Objects ===
    const ITEMS = CFG.ITEMS || [];
    let placement = {}; // { slotIndex: itemKey }
    let foundSet = new Set(); // bleibt für UI-Zähler (zeigt gebundene Items!)
    let completionShown = false;

    // ======= Lightbox-Pause/Resume =======
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

    function pauseScaresAndSound() {
      if (state.pausedByLightbox) return;
      state.pausedByLightbox = true;

      // Jumpscares stoppen / verhindern
      state.wasScares = state.scares;
      state.scares = false;
      if (state.scaryTimer) { clearTimeout(state.scaryTimer); state.scaryTimer = null; }

      // Overlay sofort schließen, falls einer gerade läuft
      const overlay = $('#screamer');
      if (overlay) { overlay.classList.remove('visible'); overlay.innerHTML = ''; }

      // Whisper merken & stoppen
      state.wasWhispering = !!state.whisperNode;
      if (state.whisperNode) {
        try { state.whisperNode.stop(); } catch (_) { }
        try { state.whisperNode.disconnect?.(); } catch (_) { }
        state.whisperNode = null;
      }

      // Master stumm schalten (sanft)
      if (state.audioCtx && state.masterGain) {
        const now = state.audioCtx.currentTime;
        try {
          state.masterGain.gain.cancelScheduledValues(now);
          state.masterGain.gain.setTargetAtTime(0.0001, now, 0.03);
        } catch (_) { }
      }
    }

    function resumeScaresAndSound() {
      if (!state.pausedByLightbox) return;
      state.pausedByLightbox = false;

      // Scares ggf. reaktivieren
      if (state.wasScares) {
        state.scares = true;
        scheduleRandomScare();
      }
      state.wasScares = null;

      // Whisper ggf. neu starten
      if (state.wasWhispering) {
        state.wasWhispering = false;
        whisper();
      }

      // Master wieder hochfahren
      if (state.audioCtx && state.masterGain) {
        const now = state.audioCtx.currentTime;
        try {
          state.masterGain.gain.cancelScheduledValues(now);
          state.masterGain.gain.setTargetAtTime(0.8, now, 0.05);
        } catch (_) { }
      }
    }

    // ===== Item-Lightbox (mit optionalem Badge-CTA; jetzt nur noch Anzeige nach Bindung) =====
    function createItemLightbox() {
      const dlg = document.createElement("dialog");
      dlg.id = "item-lightbox";
      dlg.className = "item-lightbox";
      dlg.innerHTML = `
        <div class="lb-content">
          <button class="lb-close" aria-label="Schließen">×</button>
          <img class="lb-img" alt="Gefundenes Objekt" />
          <div class="lb-caption"></div>
          <div class="lb-actions" hidden>
            <button class="btn btn--red lb-btn" id="lb-badge-btn">Badge holen</button>
          </div>
        </div>
      `;

      // Close interactions
      dlg.querySelector(".lb-close")?.addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => {
        const card = dlg.querySelector(".lb-content");
        const r = card?.getBoundingClientRect();
        if (!r) return;
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          dlg.close();
        }
      });

      // Beim Schließen: CTA sauber zurücksetzen + Audio/Scares fortsetzen
      dlg.addEventListener("close", () => {
        const actions = dlg.querySelector(".lb-actions");
        const btn = dlg.querySelector("#lb-badge-btn");
        if (actions) actions.hidden = true;
        if (btn) btn.onclick = null;
        resumeScaresAndSound();
      });

      // API
      const open = ({ src, name, showBadgeCTA = false, onBadgeClick = null }) => {
        const img = dlg.querySelector(".lb-img");
        const cap = dlg.querySelector(".lb-caption");
        const actions = dlg.querySelector(".lb-actions");
        const btn = dlg.querySelector("#lb-badge-btn");

        if (img) img.src = src;
        if (cap) cap.textContent = name || "";

        if (actions) {
          if (showBadgeCTA) {
            actions.hidden = false;
            if (btn) {
              btn.onclick = (ev) => {
                ev.preventDefault();
                if (typeof onBadgeClick === "function") onBadgeClick();
                dlg.close();
              };
            }
          } else {
            actions.hidden = true;
            if (btn) btn.onclick = null;
          }
        }

        pauseScaresAndSound();
        if (!dlg.open) dlg.showModal();
      };

      document.body.appendChild(dlg);
      return { dialog: dlg, open };
    }
    const itemLightbox = createItemLightbox();

    // ===== Badge-Modal (Horror) =====
    function createBadgeModalHorror() {
      const dlg = document.createElement("dialog");
      dlg.id = "horror-badge-modal";
      dlg.className = "badge-modal";
      dlg.innerHTML = `
        <article class="badge-card">
          <div class="badge-frame">
            <img id="horror-badge-img" alt="Horror-Badge" />
          </div>
          <div class="badge-caption">
            <div class="t1">Glückwunsch</div>
            <div class="t2">Die Fluchgegenstände gehören dir!</div>
          </div>
          <div class="badge-actions">
            <button class="btn btn--red" id="horror-badge-close">Schließen</button>
          </div>
        </article>
      `;

      // Schließen bei Klick außerhalb der Karte
      dlg.addEventListener("click", (e) => {
        const card = dlg.querySelector(".badge-card");
        const r = card?.getBoundingClientRect();
        if (!r) return;
        const outside = (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
        if (outside) dlg.close();
      });
      dlg.querySelector("#horror-badge-close")?.addEventListener("click", () => dlg.close());

      const open = (imgSrc) => {
        const img = dlg.querySelector("#horror-badge-img");
        if (img) {
          img.src = imgSrc;
          img.onerror = () => { img.alt = "Badge-Bild fehlt (" + imgSrc + ")"; };
        }
        if (!dlg.open) dlg.showModal();
      };

      document.body.appendChild(dlg);
      return { dialog: dlg, open };
    }

    const badgeModal = createBadgeModalHorror();

    function showCompletionPopup() {
      const imgSrc = CFG.withV(CFG.IMG_BASE + 'gefunden.png');
      badgeModal.open(imgSrc);
    }

    function finaleSequenceThenBadge() {
      if (completionShown) return;
      completionShown = true;
      pauseScaresAndSound();

      const black = document.createElement('div');
      black.className = 'finale-black';
      document.body.appendChild(black);

      audioBassDrop();
      setT(() => {
        black.remove();
        showCompletionPopup();
        resumeScaresAndSound();
      }, 1200);
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

    function moveItemToRandomTile(itemKey) {
      const tiles = $$('.tiles .tile');
      const freeSlots = tiles
        .map((_, i) => i)
        .filter(i => !Object.prototype.hasOwnProperty.call(placement, String(i)));
      // remove old position of this item
      for (const k in placement) {
        if (placement[k] === itemKey) delete placement[k];
      }
      const newIdx = freeSlots.length
        ? freeSlots[Math.floor(Math.random() * freeSlots.length)]
        : Math.floor(Math.random() * tiles.length);
      placement[String(newIdx)] = itemKey;
    }

    function itemByKey(key) { return ITEMS.find(i => i.key === key); }

    // ======== HALLE DER PRÜFUNG (Dialog + Nebel) ========
    function createTrialHall() {
      const dlg = document.createElement('dialog');
      dlg.id = 'trial-hall';
      dlg.className = 'trial-hall';
      dlg.innerHTML = `
        <div class="trial-wrap">
          <canvas class="fog" aria-hidden="true"></canvas>
          <div class="trial-card" role="document">
            <div class="trial-head">
              <div class="trial-title">Halle der Prüfung</div>
              <button class="trial-close" aria-label="Abbrechen">×</button>
            </div>
            
            <!-- Intro mit Erklärung + Start -->
            <div class="trial-intro" id="trial-intro">
              <div class="trial-instructions"></div>
              <button class="btn btn--red trial-start" id="trial-start">Prüfung beginnen</button>
            </div>

            <!-- Challenge-Fläche (zunächst versteckt bis Start gedrückt) -->
            <div class="trial-area" id="trial-area" hidden></div>

            <div class="trial-footer">
              <button class="btn small btn--ghost" id="trial-cancel">Aufgeben</button>
              <div class="trial-timer" id="trial-timer" aria-live="polite"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dlg);

      // Close button -> fail
      dlg.querySelector('.trial-close')?.addEventListener('click', () => dlg.close('fail'));
      dlg.querySelector('#trial-cancel')?.addEventListener('click', () => dlg.close('fail'));

      // Fog anim
      const canvas = dlg.querySelector('.fog');
      const g = canvas.getContext('2d');
      function fogResize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      on(window, 'resize', fogResize);
      fogResize();

      let t = 0;
      function fogTick() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        g.clearRect(0, 0, w, h);
        for (let i = 0; i < 20; i++) {
          const x = (Math.sin(t * 0.002 + i) * 0.5 + 0.5) * w;
          const y = (Math.cos(t * 0.0015 + i * 1.7) * 0.5 + 0.5) * h;
          const r = 80 + (Math.sin(t * 0.0012 + i) * 0.5 + 0.5) * 120;
          const a = 0.035 + Math.random() * 0.02;
          const grd = g.createRadialGradient(x, y, 0, x, y, r);
          grd.addColorStop(0, `rgba(200,200,220,${a})`);
          grd.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = grd;
          g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
        t += 16;
        setR(fogTick);
      }
      fogTick();

      return dlg;
    }
    const trialHall = createTrialHall();

    function openTrialHall({ title, htmlInstructions }) {
      const instr = trialHall.querySelector('.trial-instructions');
      instr.innerHTML = htmlInstructions || '';
      const head = trialHall.querySelector('.trial-title');
      head.textContent = title || 'Halle der Prüfung';

      // <<< HARTES RESET der View >>>
      const intro = trialHall.querySelector('#trial-intro');
      const area = trialHall.querySelector('#trial-area');
      if (intro) intro.removeAttribute('hidden');
      if (area) {
        area.innerHTML = '';             // alten Challenge-DOM entfernen
        area.setAttribute('hidden', ''); // sicher verstecken
      }

      pauseScaresAndSound();
      if (!trialHall.open) trialHall.showModal();
    }

    // <<< WICHTIG: wieder vorhanden, damit Trial.pass()/fail() den Dialog schließen >>>
    function closeTrialHall(result = 'ok') {
      try {
        if (trialHall.open) trialHall.close(result);
      } finally {
        // Audio & Random-Scares sauber fortsetzen
        resumeScaresAndSound();
      }
    }



    // NEU: wartet auf Klick „Prüfung beginnen“, zeigt dann die Area an
    function waitForTrialStart() {
      return new Promise((resolve) => {
        const intro = trialHall.querySelector('#trial-intro');
        const area = trialHall.querySelector('#trial-area');
        const btn = trialHall.querySelector('#trial-start');

        // Falls der Dialog geschlossen wird, bevor man startet: sauber abbrechen
        const onClose = () => {
          btn?.removeEventListener('click', onClick);
          trialHall.removeEventListener('close', onClose);
          resolve(false);
        };
        trialHall.addEventListener('close', onClose, { once: true });

        const onClick = async () => {
          btn?.removeEventListener('click', onClick);
          trialHall.removeEventListener('close', onClose);

          intro?.setAttribute('hidden', '');
          area?.removeAttribute('hidden');

          try {
            ensureAudio();
            await state.audioCtx?.resume?.();
            const now = state.audioCtx?.currentTime ?? 0;
            state.masterGain?.gain?.cancelScheduledValues?.(now);
            state.masterGain?.gain?.setTargetAtTime?.(0.8, now, 0.05);
          } catch (_) { }

          resolve(true);
        };

        btn?.addEventListener('click', onClick, { once: true });
      });
    }


    // ======== CHALLENGES (je Item) ========
    // Helpers
    const Trial = {
      timer(el, seconds, onTick, onEnd) {
        let left = seconds;
        el.textContent = `${left}s`;
        const id = setI(() => {
          left -= 1;
          el.textContent = `${left}s`;
          if (left <= 0) { clearInterval(id); onEnd?.(); }
          else onTick?.(left);
        }, 1000);
        return () => clearInterval(id);
      },
      setArea(html = '') {
        const area = document.getElementById('trial-area');
        area.innerHTML = html;
        return area;
      },
      pass() { closeTrialHall('ok'); },
      fail() { closeTrialHall('fail'); },
    };

    // Difficulty scaling (optional 4.1)
    function difficultyBase() {
      // 0,1,2,3 je nach bereits gebundener Items
      const n = state.boundItems.size;
      return Math.min(Math.max(n, 0), 3);
    }

    // TAROT: Runen-Reihenfolge (Simon)
    function challenge_tarot() {
      return new Promise((resolve) => {
        const level = difficultyBase(); // 0..3
        const length = 3 + level; // 3–6
        const runes = ['✠', '☿', '⛧', 'ᚠ', 'ᚱ', 'ᛟ'];
        const seq = Array.from({ length }, () => Math.floor(Math.random() * runes.length));
        const instructions = `
          <p><strong>Prüfung der Zeichen:</strong> Merke dir die blinkende <em>Runenfolge</em> und tippe sie danach <em>in derselben Reihenfolge</em>.</p>
        `;
        openTrialHall({ title: 'Tarot – Runenfolge', htmlInstructions: instructions });

        // >>> Neu: erst starten wenn der Nutzer bereit ist
        waitForTrialStart().then(() => {
          const area = Trial.setArea(`
            <div class="runes-grid">
              ${runes.map((r, i) => `<button class="r rune" data-i="${i}">${r}</button>`).join('')}
            </div>
            <div class="runes-input" id="runes-input" aria-label="Deine Eingabe"></div>
            <div class="trial-note">Bereit…</div>
          `);
          const inputStrip = area.querySelector('#runes-input');
          const note = area.querySelector('.trial-note');
          const buttons = Array.from(area.querySelectorAll('.r'));

          let showing = true, pos = 0;

          async function flash(i) {
            buttons[i].classList.add('on');
            thump(2);
            await new Promise(r => setT(r, 420));
            buttons[i].classList.remove('on');
            await new Promise(r => setT(r, 150));
          }

          (async function showSeq() {
            note.textContent = 'Merken…';
            for (const i of seq) { await flash(i); }
            showing = false;
            note.textContent = 'Deine Eingabe…';
          })();

          buttons.forEach(b => b.addEventListener('click', () => {
            if (showing) return;
            const i = parseInt(b.dataset.i, 10);

            // Sofortiges Button-Feedback
            b.classList.add('press', 'user');
            setT(() => b.classList.remove('press', 'user'), 180);

            // Chip in die Eingabe-Leiste (zeigt gedrücktes Symbol)
            const chip = document.createElement('span');
            chip.className = 'ri';            // Basis-Style
            chip.textContent = runes[i];      // Symbol anzeigen
            inputStrip.appendChild(chip);

            // Korrektheit prüfen und Chip einfärben
            if (i === seq[pos]) {
              chip.classList.add('ri--ok');
              pos++;
              thump(1);
              if (pos >= seq.length) {
                Trial.pass();
                resolve(true);
              }
            } else {
              chip.classList.add('ri--err');
              triggerJumpscare('tarot-fail');
              Trial.fail();
              resolve(false);
            }
          }, { passive: true }));

        });
      });
    }

    // AFFENPFOTE: Bannmeter – Halten & im Ziel loslassen (mit Armierung gegen frühe Up-Events)
    function challenge_affenpfote() {
      return new Promise((resolve) => {
        ensureAudio();
        const ctx = state.audioCtx;
        const level = difficultyBase();                  // 0..3
        const fillTime = 2600 - level * 300;             // 2.6s → 1.7s
        const tolerance = 7 - level * 1.5;               // ±7% → ±2.5% Band
        const target = 55 + Math.random() * 30;          // 55–85%
        const instructions = `
      <p><strong>Prüfung des Flüsterns:</strong> <em>Halte</em> den Knopf gedrückt und
      <em>lasse los</em>, wenn die Füllung die <strong>Markierung</strong> erreicht.
      Je näher dran, desto besser – daneben ist der Bann gebrochen.</p>
    `;
        openTrialHall({ title: 'Affenpfote – Bannmeter', htmlInstructions: instructions });

        waitForTrialStart().then(() => {
          const area = Trial.setArea(`
        <div class="meter" id="meter" aria-hidden="true">
          <div class="meter__fill" id="fill"></div>
          <div class="meter__mark" id="mark" style="left:${target}%"></div>
        </div>
        <button id="hold" class="btn btn--red bigbtn" aria-pressed="false">HALTEN … und im Ziel LOSLASSEN</button>
        <div class="trial-note">Ziel bei ~${Math.round(target)}%</div>
      `);

          const note = area.querySelector('.trial-note');
          const btn = area.querySelector('#hold');
          const fillEl = area.querySelector('#fill');
          let raf = null, startTs = 0, pct = 0, active = false, armed = false;

          // Audio: steigender Ton während des Haltens
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = 160;
          g.gain.value = 0.0001;
          o.connect(g).connect(state.masterGain);
          o.start();

          function update(t) {
            if (!active) return;
            const elapsed = t - startTs;
            pct = Math.min(100, (elapsed / fillTime) * 100);
            fillEl.style.width = pct + '%';
            // Audio-Mapping
            const closeness = Math.max(0, 1 - Math.abs(pct - target) / 50); // 1 nahe, 0 weit
            o.frequency.value = 140 + pct * 4 + closeness * 80;
            g.gain.value = 0.02 + closeness * 0.35;

            if (pct >= 100) { finish(false, 'Zu spät…'); return; }
            raf = requestAnimationFrame(update);
          }

          function startHold() {
            if (active) return;
            active = true;
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('pulse');
            setT(() => btn.classList.remove('pulse'), 140);
            pct = 0;
            fillEl.style.width = '0%';
            try { g.gain.cancelScheduledValues(ctx.currentTime); } catch (_) { }
            // Armierung: erst nach erstem rAF sind Up-/KeyUp gültig
            requestAnimationFrame((t) => {
              startTs = t;
              armed = true;
              raf = requestAnimationFrame(update);
            });
          }

          function endHold() {
            if (!active || !armed) return; // vor Armierung ignorieren
            active = false;
            armed = false;
            btn.setAttribute('aria-pressed', 'false');
            if (raf) cancelAnimationFrame(raf);
            const diff = Math.abs(pct - target);
            if (diff <= tolerance) {
              note.textContent = `Treffer! Abweichung ${diff.toFixed(1)}% (<= ${tolerance}%)`;
              thump(2);
              cleanup();
              Trial.pass(); resolve(true);
            } else {
              note.textContent = `Daneben: ${diff.toFixed(1)}% (erlaubt ${tolerance}%)`;
              cleanup();
              triggerJumpscare('hold-fail');
              Trial.fail(); resolve(false);
            }
          }

          function finish(ok, msg) {
            active = false;
            armed = false;
            if (raf) cancelAnimationFrame(raf);
            note.textContent = msg || (ok ? 'Geschafft!' : 'Gescheitert…');
            cleanup();
            if (ok) { Trial.pass(); resolve(true); }
            else { triggerJumpscare('hold-timeout'); Trial.fail(); resolve(false); }
          }

          // ——— Cleanup entfernt JEDEN Listener & Audio ———
          function cleanup() {
            try { o.stop(); } catch (_) { }
            try { o.disconnect(); g.disconnect(); } catch (_) { }
            btn.removeEventListener('mousedown', onDown);
            btn.removeEventListener('touchstart', onDown, { passive: false });
            btn.removeEventListener('keydown', onKeyDown);
            btn.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp, { passive: false });
          }

          // Eingaben (Maus, Touch, Tastatur)
          const onDown = (e) => { e.preventDefault(); startHold(); };
          const onUp = (e) => { e.preventDefault(); endHold(); };
          const onKeyDown = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startHold(); } };
          const onKeyUp = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); endHold(); } };

          btn.addEventListener('mousedown', onDown);
          btn.addEventListener('touchstart', onDown, { passive: false });

          window.addEventListener('mouseup', onUp);
          window.addEventListener('touchend', onUp, { passive: false });

          btn.addEventListener('keydown', onKeyDown);
          btn.addEventListener('keyup', onKeyUp);

          // Safety: Dialog zu -> aufräumen
          trialHall.addEventListener('close', () => {
            if (raf) cancelAnimationFrame(raf);
            cleanup();
          }, { once: true });
        });
      });
    }



    // KRUZIFIX: Echos finden (Hot/Cold mit Tonhöhe/Lautstärke)
    function challenge_kruzifix() {
      return new Promise((resolve) => {
        ensureAudio();
        const ctx = state.audioCtx;
        Promise.resolve(ctx?.resume?.()).catch(() => { });
        // Master vorsichtshalber hochziehen, falls anderswo nochmals abgesenkt
        try {
          const now = ctx?.currentTime ?? 0;
          state.masterGain?.gain?.cancelScheduledValues?.(now);
          state.masterGain?.gain?.setTargetAtTime?.(0.8, now, 0.03);
        } catch (_) { }

        const instructions = `
          <p><strong>Prüfung der Echos:</strong> Ziehe den Marker. <em>Je näher</em> du der Quelle kommst, desto <em>lauter</em> und <em>höher</em> der Ton.</p>
        `;
        openTrialHall({ title: 'Kruzifix – Echos finden', htmlInstructions: instructions });

        waitForTrialStart().then(() => {
          const area = Trial.setArea(`
            <div class="echo-bar" id="bar">
              <div class="echo-target" aria-hidden="true"></div>
              <div class="echo-marker" id="marker" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
            </div>
            <div class="trial-note">Suche…</div>
          `);
          const note = area.querySelector('.trial-note');
          const bar = area.querySelector('#bar');
          const marker = area.querySelector('#marker');

          const target = 10 + Math.random() * 80; // 10–90%
          const needStayMs = 700 + difficultyBase() * 400; // 0.7–1.9 s
          let inZoneSince = null;

          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = 180;
          g.gain.value = 0.05;
          o.connect(g).connect(state.masterGain);
          o.start();

          function setMarker(pct) {
            pct = Math.max(0, Math.min(100, pct));
            marker.style.left = pct + '%';
            marker.setAttribute('aria-valuenow', String(Math.round(pct)));

            const dist = Math.abs(pct - target); // 0..100
            const closeness = Math.max(0, 1 - dist / 50); // 1 nahe, 0 weit
            // map
            o.frequency.value = 140 + closeness * 600;
            g.gain.value = 0.02 + closeness * 0.28;

            const now = performance.now();
            if (dist < 6 + (3 - difficultyBase())) {
              if (!inZoneSince) inZoneSince = now;
              note.textContent = 'Fast… halte durch!';
              if (now - inZoneSince >= needStayMs) {
                o.stop(); Trial.pass(); resolve(true);
              }
            } else {
              inZoneSince = null;
              note.textContent = 'Suche…';
            }
          }

          function clientXToPct(x) {
            const r = bar.getBoundingClientRect();
            return ((x - r.left) / r.width) * 100;
          }

          function onPointer(e) {
            const x = (e.touches?.[0]?.clientX ?? e.clientX);
            setMarker(clientXToPct(x));
          }

          bar.addEventListener('pointerdown', onPointer, { passive: true });
          bar.addEventListener('pointermove', e => { if (e.buttons) onPointer(e); }, { passive: true });
          bar.addEventListener('touchstart', onPointer, { passive: true });
          bar.addEventListener('touchmove', onPointer, { passive: true });
          marker.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') setMarker(parseFloat(marker.style.left || '0') - 2);
            if (e.key === 'ArrowRight') setMarker(parseFloat(marker.style.left || '0') + 2);
          });

          // initial
          setMarker(0);

          trialHall.addEventListener('close', () => { try { o.stop(); } catch (_) { } }, { once: true });
          // fail timeout (30s safety)
          setT(() => { try { o.stop(); } catch (_) { } triggerJumpscare('echo-timeout'); Trial.fail(); resolve(false); }, 30000);
        });
      });
    }

    // SPIELUHR: Siegel unter Zeitdruck – Vorschau-Reihenfolge (Blink + Ton) mit gesperrten Buttons
    function challenge_spieluhr() {
      return new Promise((resolve) => {
        ensureAudio();
        const level = difficultyBase();
        const total = 10 - level * 1; // 10,9,8,7s – Zeitdruck bleibt
        const instructions = `
      <p><strong>Prüfung des Siegels:</strong> Merke dir die <em>blinkende Reihenfolge der drei Siegel</em> und tippe sie danach <em>in derselben Reihenfolge</em> – aber schnell!</p>
    `;
        openTrialHall({ title: 'Spieluhr – Zeitdruck-Siegel', htmlInstructions: instructions });

        waitForTrialStart().then(() => {
          // Reihenfolge bauen (z. B. 0→1→2, aber gemischt)
          const order = [0, 1, 2].sort(() => Math.random() - 0.5);

          const area = Trial.setArea(`
        <div class="seals">
          <button class="seal" data-i="0" aria-label="Siegel 1">◈</button>
          <button class="seal" data-i="1" aria-label="Siegel 2">✠</button>
          <button class="seal" data-i="2" aria-label="Siegel 3">☾</button>
        </div>
        <div class="trial-note">Reihenfolge wird gezeigt…</div>
      `);

          const note = area.querySelector('.trial-note');
          const seals = Array.from(area.querySelectorAll('.seal'));
          let pos = 0;
          let showing = true; // solange true, ist noch Vorschau

          // Buttons während der Vorschau HART sperren
          seals.forEach(b => b.disabled = true);

          // kleiner Audiocue pro Siegel (verschiedene Tonhöhen)
          function ping(i) {
            const ctx = state.audioCtx;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const now = ctx.currentTime;
            const freqs = [660, 880, 990]; // für 0,1,2
            o.type = 'sine';
            o.frequency.value = freqs[i] || 800;
            g.gain.value = 0.0001;
            o.connect(g).connect(state.masterGain);
            o.start(now);
            g.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
            o.stop(now + 0.24);
          }

          // Ein einzelnes Siegel kurz „aufblitzen“ lassen
          function flashSeal(i) {
            return new Promise((r) => {
              const btn = seals[i];
              if (!btn) return r();
              btn.classList.add('on');
              ping(i);
              setT(() => {
                btn.classList.remove('on');
                setT(r, 140); // kleine Pause zwischen den Blinks
              }, 360);
            });
          }

          // Reihenfolge zeigen
          (async () => {
            note.textContent = 'Reihenfolge wird gezeigt…';
            for (const i of order) { await flashSeal(i); }
            showing = false;
            seals.forEach(b => b.disabled = false); // jetzt erst frei
            note.textContent = 'Deine Eingabe…';
          })();

          // Eingabe-Handler
          seals.forEach(b => b.addEventListener('click', () => {
            if (showing || b.disabled) return; // echte Sperre

            const i = parseInt(b.dataset.i, 10);
            b.classList.add('on');
            setT(() => b.classList.remove('on'), 160);
            thump(1);

            if (i === order[pos]) {
              pos++;
              if (pos >= order.length) { Trial.pass(); resolve(true); }
            } else {
              triggerJumpscare('seal-fail');
              Trial.fail(); resolve(false);
            }
          }, { passive: true }));

          // Timer wie gehabt
          const stop = Trial.timer(document.getElementById('trial-timer'), total, null, () => {
            triggerJumpscare('seal-timeout');
            Trial.fail(); resolve(false);
          });
          trialHall.addEventListener('close', stop, { once: true });
        });
      });
    }



    async function runChallengeFor(itemKey) {
      // Erklärung + Challenge starten
      const map = {
        tarot: challenge_tarot,
        affenpfote: challenge_affenpfote,
        kruzifix: challenge_kruzifix,
        spieluhr: challenge_spieluhr,
      };
      const fn = map[itemKey];
      if (!fn) return false;
      const ok = await fn();
      return ok;
    }

    // ====== Item-Fund → Prüfung → Bindung/Fail ======
    function revealItem(tile, itemKey) {
      const it = itemByKey(itemKey);
      if (!it) return;

      // Flip + Card (kurz) – Hinweis, dass Prüfung startet
      tile.classList.add('tile--flipped');
      const card = document.createElement('div');
      card.className = 'item-card';
      const img = new Image();
      img.src = it.img;
      img.alt = it.name;
      img.className = 'item-card__img';
      const label = document.createElement('div');
      label.className = 'item-card__name';
      label.innerHTML = `Du hast <strong>${it.name}</strong> erspürt…`;
      const tip = document.createElement('div');
      tip.className = 'item-card__tip';
      tip.textContent = '…die Prüfung beginnt.';
      card.appendChild(img); card.appendChild(label); card.appendChild(tip);
      tile.appendChild(card);

      setT(async () => {
        const ok = await runChallengeFor(itemKey);

        // remove temp card / flip back or to found
        card.remove();
        tile.classList.remove('tile--flipped');

        if (ok) {
          // bind item (erst jetzt zählt es als gefunden!)
          if (!foundSet.has(itemKey)) {
            foundSet.add(itemKey);
            state.boundItems.add(itemKey);
            tile.classList.add('tile--found');
            updateFoundCounter();
          }

          // Lightbox zeigen
          itemLightbox.open({
            src: it.img,
            name: it.name,
            showBadgeCTA: false
          });

          // Finale?
          if (foundSet.size === ITEMS.length) {
            finaleSequenceThenBadge();
          }

        } else {
          state.fails++;
          // Fail: Item despawn + neu verstecken
          tile.classList.remove('tile--found');
          moveItemToRandomTile(itemKey);
        }
      }, 700);
    }

    function initHiddenObjects() {
      $$('.tiles .tile').forEach((t, idx) => t.dataset.slot = String(idx));
      randomizePlacement();
      foundSet = new Set();
      state.boundItems.clear();
      updateFoundCounter();
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
          if (tile.classList.contains('tile--flipped')) return;

          const slot = tile.dataset.slot;
          const itemKey = placement[slot];
          if (itemKey && !tile.classList.contains('tile--found')) {
            revealItem(tile, itemKey);
            return;
          }

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
      const overlay = $('#screamer');
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

      // Dialoge entfernen (falls noch vorhanden)
      const bm = document.getElementById('horror-badge-modal');
      if (bm) { try { bm.remove(); } catch (_) { } }
      const lb = document.getElementById('item-lightbox');
      if (lb) { try { lb.remove(); } catch (_) { } }
      const th = document.getElementById('trial-hall');
      if (th) { try { th.remove(); } catch (_) { } }
      const fb = document.querySelector('.finale-black');
      if (fb) { try { fb.remove(); } catch (_) { } }
    };

  })();

  // Rückgabe: globaler Teardown wenn Tag verlassen wird
  return () => {
    const extra = host._tag4_cleanup || (() => { });
    _teardown(extra);
  };
}


export default { build };
