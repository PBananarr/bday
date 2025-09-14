// Tag 7 – Finale
// Abschluss-Tag mit großem Emoji-Button und schwebenden Chips.

import { REQUIRED, BTN_READY, BTN_LOCKED } from "./finale_data.js";

function readState() {
  try { return JSON.parse(localStorage.getItem("bdayModState") || "{}"); }
  catch { return {}; }
}

function findFirstMissing() {
  const st = readState();
  for (const d of REQUIRED) {
    if (!st[d.key]) return d; // erstes nicht gelöstes Tag aus 1–6
  }
  return null;
}

export function build(root, api) {
  root.innerHTML = `
    <section class="card finale-card">
      <h2>Tag 7 · Finale</h2>
      <p class="lead">Letzte Etappe! Wenn alle Badges grün sind, kannst du hier die Geburtstagsüberraschung abholen.</p>

      <div class="cta-wrap">
        <button class="finale-cta" id="finaleCta" type="button" aria-live="polite">
          <span class="aurora" aria-hidden="true"></span>

          <span class="badge-ring" aria-hidden="true">
            <span class="chip chip-1" title="Thai Monstera">🪴</span>
            <span class="chip chip-2" title="Survival">🧭</span>
            <span class="chip chip-3" title="Escape">👻</span>
            <span class="chip chip-4" title="Horror">🩸</span>
            <span class="chip chip-5" title="Sport">🏃‍♀️</span>
            <span class="chip chip-6" title="Puzzle">🧩</span>
            <span class="chip chip-7" title="Safety / Wissen">🛡️</span>
          </span>

          <span class="center">
            <span class="number" aria-hidden="true">37</span>
            <span class="cta-label">${findFirstMissing() ? BTN_LOCKED : BTN_READY}</span>
          </span>
        </button>
        <p class="hint" id="finaleMsg" hidden></p>
      </div>

      <div class="tiny-note">Tipp: Du kannst Tag 7 am Geburtstag auch direkt öffnen.</div>
    </section>
  `;

  // ---- Floating-Chips: nur Außenrand-Bounce, frei hinter dem Text ----------
  function startFloatingChips(btn) {
    const ring  = btn.querySelector('.badge-ring');
    const chips = Array.from(ring?.children || []);
    if (!chips.length) return () => {};

    btn.classList.add('float');

    let R = 0;                // Button-Radius (px)
    let CHIP_R = 0;           // Chip-Halbradius (px) – erst nach Layout korrekt
    const PADDING = 8;

    const state = chips.map((el) => ({
      el, x:0, y:0, vx:0, vy:0, speed:0, lastTurn:0, nextTurn:1000 + Math.random()*2000
    }));

    function measure(){
      // Größe des Buttons
      const s = Math.min(btn.clientWidth, btn.clientHeight);
      R = s / 2;

      // Chip-Größe erst jetzt (nach Layout) sauber messen
      CHIP_R = chips[0]?.offsetWidth ? (chips[0].offsetWidth / 2) : Math.max(14, parseFloat(getComputedStyle(chips[0]).width) / 2) || 14;

      const outerLimit = Math.max(0, R - CHIP_R - PADDING);

      state.forEach((c) => {
        const limit = Math.max(outerLimit, 1);

        if (!c.speed){
          // Start: nicht im Zentrum, mind. 35% des Flugradius
          const a = Math.random()*Math.PI*2;
          const minD = limit * 0.35;
          const d = minD + Math.random()*(Math.max(0, limit - minD));
          c.x = Math.cos(a)*d;
          c.y = Math.sin(a)*d;

          const dir = Math.random()*Math.PI*2;
          c.speed = 10 + Math.random()*18; // 10–28 px/s
          c.vx = Math.cos(dir)*c.speed;
          c.vy = Math.sin(dir)*c.speed;
        } else {
          // bei Resize einklemmen
          const dist = Math.hypot(c.x, c.y);
          if (dist > limit){
            const k = limit / (dist || 1);
            c.x *= k; c.y *= k;
          }
        }
        c.el.style.setProperty('--x', `${c.x}px`);
        c.el.style.setProperty('--y', `${c.y}px`);
      });
    }

    // Reflektion an der Rand-Normale; robust gegen dist≈0
    function reflect(c, nx, ny){
      let dist = Math.hypot(nx, ny);
      if (dist < 1e-3) {
        // zufällige Normale, falls exakt im Zentrum gelandet
        const a = Math.random()*Math.PI*2;
        nx = Math.cos(a); ny = Math.sin(a); dist = 1;
      }
      const nX = nx / dist, nY = ny / dist;
      const dot = c.vx*nX + c.vy*nY;
      c.vx -= 2*dot*nX;
      c.vy -= 2*dot*nY;
      const len = Math.hypot(c.vx, c.vy) || 1;
      c.vx *= c.speed/len; c.vy *= c.speed/len;
    }

    let raf = 0, last = 0;
    function tick(t){
      if (!last) last = t;
      let dt = (t - last)/1000;
      dt = Math.min(dt, 0.05);
      last = t;

      // Wenn der Button noch nicht gemessen ist (z.B. erste Frames), nichts tun
      const outer = R - CHIP_R - PADDING;
      if (!(outer > 10)) { raf = requestAnimationFrame(tick); return; }

      state.forEach((c) => {
        // leichte Richtungsänderung alle 1–3 s
        c.lastTurn += (dt*1000);
        if (c.lastTurn > c.nextTurn){
          const rot = (Math.random()*30 - 15) * (Math.PI/180);
          const cos = Math.cos(rot), sin = Math.sin(rot);
          const nx = c.vx*cos - c.vy*sin;
          const ny = c.vx*sin + c.vy*cos;
          c.vx = nx; c.vy = ny;
          c.lastTurn = 0; c.nextTurn = 1000 + Math.random()*2000;
        }

        // nächste Position
        let nx = c.x + c.vx*dt;
        let ny = c.y + c.vy*dt;

        const dist = Math.hypot(nx, ny);

        // Bounce nur am äußeren Rand des Buttons
        if (dist > outer){
          reflect(c, nx, ny);
          const k = (outer - 0.5) / (dist || 1);
          nx *= k; ny *= k;
        }

        c.x = nx; c.y = ny;
        c.el.style.setProperty('--x', `${c.x}px`);
        c.el.style.setProperty('--y', `${c.y}px`);
      });

      raf = requestAnimationFrame(tick);
    }

    // Größe beobachten (sicherer als nur window.resize)
    const ro = new ResizeObserver(measure);
    ro.observe(btn);

    // Initial: zwei Frames warten, dann messen & starten (Layout stabil)
    requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(() => {
        measure();
        raf = requestAnimationFrame(tick);
      });
    });

    // Teardown
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      btn.classList.remove('float');
    };
  }
  // --------------------------------------------------------------------------

  // 🔽 Hilfsfunktion: echtes #final von unten an Stelle des CTA verschieben
  let restoreFinal = null; // für Cleanup
  function moveGlobalFinalInline(stopFloat) {
    const globalFinal = document.querySelector('#final');
    if (!globalFinal) return false;

    const wrap = root.querySelector('.cta-wrap');
    if (!wrap) return false;

    // Original-Position merken
    const originalParent = globalFinal.parentNode;
    const originalNext   = globalFinal.nextSibling;
    const prevHidden     = globalFinal.hidden;
    const prevDisplay    = globalFinal.style.display;

    // Warten, bis main.js das Finale sichtbar gemacht hat
    const tryShow = (tries = 0) => {
      const ready = globalFinal && !globalFinal.hidden && globalFinal.innerHTML.trim().length > 0;
      if (!ready && tries < 12) {
        return setTimeout(() => tryShow(tries + 1), 40);
      }

      // CTA weich ausblenden, Chips stoppen
      const btnEl = wrap.querySelector('.finale-cta');
      if (btnEl) btnEl.classList.add('fadeOut');
      stopFloat?.();

      setTimeout(() => {
        // Element an neue Stelle verschieben (nicht klonen)
        wrap.replaceWith(globalFinal);
        globalFinal.hidden = false;
        globalFinal.style.display = '';

        // Restore-Funktion vormerken
        restoreFinal = () => {
          if (!originalParent) return;
          globalFinal.hidden = prevHidden;
          globalFinal.style.display = prevDisplay;
          if (originalNext && originalNext.parentNode === originalParent) {
            originalParent.insertBefore(globalFinal, originalNext);
          } else {
            originalParent.appendChild(globalFinal);
          }
        };

        globalFinal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 220);
    };

    tryShow();
    return true; // Prozess angestoßen
  }

  const btn   = root.querySelector("#finaleCta");
  const label = root.querySelector(".cta-label");
  const msg   = root.querySelector("#finaleMsg");

  const stopFloat = startFloatingChips(btn);

  function refresh() {
    const missing = findFirstMissing();
    label.textContent = missing ? BTN_LOCKED : BTN_READY;
    btn.classList.toggle("is-ready", !missing);
    btn.classList.toggle("is-locked", !!missing);
    msg.hidden = true;
  }

  const onClick = () => {
    const missing = findFirstMissing();

    if (!missing) {
      btn.disabled = true;
      btn.classList.add("boom");
      try { api.solved?.(); } catch {}

      // ✅ echtes #final nach oben an Stelle des CTA verschieben
      const moved = moveGlobalFinalInline(stopFloat);

      // Fallback: falls nicht möglich → zum echten #final scrollen
      if (!moved) {
        setTimeout(() => {
          document.querySelector('#final')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
      return;
    }

    // Nicht alle gelöst → Hinweis
    btn.classList.add("shake");
    setTimeout(() => btn.classList.remove("shake"), 500);

    const partTitle = (missing.title.split("·")[1] || missing.title).trim();
    const dayLabel  = (missing.title.split("·")[0] || "").trim();
    msg.innerHTML = `😢 <strong>Dir fehlt noch „${partTitle}“ aus ${dayLabel}.</strong>`;
    msg.hidden = false;
  };

  btn.addEventListener("click", onClick);

  refresh();

  // Cleanup
  return () => {
    btn.removeEventListener("click", onClick);
    stopFloat?.();
    // #final an seinen ursprünglichen Platz zurücksetzen (falls verschoben)
    restoreFinal?.();
  };
}
