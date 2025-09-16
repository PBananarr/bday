import { SPORT_DATA } from "./sport_data.js";

export function build(host, api) {
  // HTML aus der Standalone-Seite – in Wrapper (.day-sport), ohne Script-Tags
  host.innerHTML = `<div class="day-sport"><canvas id="confetti-canvas" aria-hidden="true"></canvas>

  <header class="site-header">
    <div class="brand">
      <h1>Virtuelles Fitnessstudio</h1>
    </div>
    <div class="tagline">Tag 5: <strong>Für die Gym-Queen 💪</strong></div>
    <div class="progress-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Fortschritt">
      <div id="progress-bar"></div>
      <span id="progress-label">0%</span>
    </div>
  </header>

  <main>
    <section class="intro card">
      <h2>Deine Mission</h2>
      <p>Erkunde das <strong>virtuelle Fitnessstudio</strong>, meistere die <strong>Challenges</strong> und schnapp dir
        deinen Badge.</p>
      <ul class="ticks gym-offers">
        <li><b>Flex-Abo</b>: Bis zum Geburtstag 0 EUR – jederzeit kündbar</li>
        <li><b>Getränke-Flat</b>: Wasser & Zero-Drinks inklusive</li>
        <li><b>Handtuch-Service</b>: Fresh & fluffy – jedes Training</li>
        <li><b>Locker 37</b>: Premium-Spind reserviert – natürlich #37</li>
      </ul>
    </section>

    <section class="grid gym-grid" id="gym-grid" aria-label="Fitnessstudio-Stationen"></section>

    <section class="card challenge37" id="challenge37">
      <div class="chip">Active-Room</div>
      <h2>Die Drei-Sieben-Challenges</h2>
      <div class="grid challenge-grid"></div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-left">
      <span class="logo-mini">VF</span> <span class="muted">Virtuelles Fitnessstudio · Tag 5</span>
    </div>
    <div class="footer-right">
      <button id="show-badge" class="btn btn-ghost" disabled>Badge anzeigen</button>
      <button id="reset-progress" class="btn btn-ghost">Neu starten</button>
    </div>
  </footer>

  <!-- Badge Modal -->
  <dialog id="badge-modal" aria-labelledby="badge-title">
    <div class="badge-wrap">
      <div class="badge-hero">
        <img id="badge-img" src="" alt="Badge Bild" />
      </div>
      <div class="modal-actions">
        <button class="btn" id="badge-close">Weiter</button>
      </div>
    </div>
  </dialog>
  </div>`;

  (function () {
    // host-scope helper
    const el = sel => host.querySelector(sel);

    // Fortschritt laden (namespaced wäre optional – belassen wie Standalone)
    const state = {
      stationDone: new Set(JSON.parse(localStorage.getItem('stationDone') || '[]')),
      challengeDone: new Set(JSON.parse(localStorage.getItem('challengeDone') || '[]'))
    };
    const save = () => {
      localStorage.setItem('stationDone', JSON.stringify([...state.stationDone]));
      localStorage.setItem('challengeDone', JSON.stringify([...state.challengeDone]));
    };

    // --- Zoom-Toggle nur für die Combo-Challenge (Option A) ---
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    let _prevViewportContent = null;
    function enableZoomForChallenge() {
      if (!viewportMeta) return;
      if (_prevViewportContent == null) _prevViewportContent = viewportMeta.getAttribute('content') || '';
      const cleaned = _prevViewportContent
        .replace(/user-scalable\s*=\s*no/g, '')
        .replace(/maximum-scale\s*=\s*[^,]+/g, '')
        .replace(/,{2,}/g, ',')
        .replace(/^\s*,|,\s*$/g, '');
      viewportMeta.setAttribute('content', (cleaned ? cleaned + ', ' : '') + 'user-scalable=yes, maximum-scale=5');
    }
    function restoreViewport() {
      if (!viewportMeta || _prevViewportContent == null) return;
      viewportMeta.setAttribute('content', _prevViewportContent);
      _prevViewportContent = null;
    }

    function pct() {
      const total = SPORT_DATA.stations.length + SPORT_DATA.challenge37.length;
      const done = state.stationDone.size + state.challengeDone.size;
      return Math.round((done / total) * 100);
    }

    function updateProgress() {
      const p = pct();
      const bar = el('#progress-bar');
      const label = el('#progress-label');
      if (bar) bar.style.width = p + '%';
      if (label) label.textContent = p + '%';
      if (p === 100) {
        const btn = el('#show-badge'); if (btn) btn.disabled = false;
        // solved einmalig melden
        if (!updateProgress._fired && api && typeof api.solved === 'function') {
          try { api.solved(); } catch (_) { }
          updateProgress._fired = true;
        }
        openBadgeModal();
      }
    }

    function confettiBurst() {
      const canvas = el('#confetti-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width = host.clientWidth;
      const H = canvas.height = host.clientHeight;
      const N = 180;
      const parts = new Array(N).fill(0).map(() => ({
        x: Math.random() * W, y: -20 - Math.random() * H * 0.4, r: 3 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 2.5, vy: 2 + Math.random() * 3, a: Math.random() * Math.PI * 2, s: 0.02 + Math.random() * 0.04
      }));
      let t = 0;
      (function frame() {
        t++; ctx.clearRect(0, 0, W, H);
        parts.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.a += p.s;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
          ctx.restore();
        });
        if (t < 160) requestAnimationFrame(frame);
      })();
    }

    function renderStations() {
      const grid = el('#gym-grid');
      if (!grid) return;
      grid.innerHTML = '';
      SPORT_DATA.stations.forEach(st => {
        const card = document.createElement('article');
        card.className = 'card station'; card.dataset.id = st.id;
        const done = state.stationDone.has(st.id);
        card.innerHTML = `
          <div class="chip">${st.chip}</div>
          <h3>${st.name}</h3>
          <p>${st.description}</p>
          <div class="content" id="content-${st.id}"></div>
          <div class="actions">
            <span class="pill">${done ? 'Erledigt' : 'Offen'}</span>
            <button class="btn" ${done ? 'disabled' : ''}>Start</button>
          </div>`;
        grid.appendChild(card);
        card.querySelector('.btn').addEventListener('click', () => startStation(st));
      });
    }

    function startStation(st) {
      const area = el('#content-' + st.id);
      if (!area) return;
      area.innerHTML = '';

      if (st.type === 'quiz') {
        const wrap = document.createElement('div');
        if (st.question) { wrap.innerHTML = `<p>${st.question}</p>`; }
        const choices = document.createElement('div');
        choices.style.display = 'grid'; choices.style.gap = '8px'; choices.style.gridTemplateColumns = 'repeat(2, 1fr)';
        st.choices.forEach(c => {
          const b = document.createElement('button');
          b.className = 'btn'; b.textContent = String(c);
          b.addEventListener('click', () => {
            if (c === st.answer) { completeStation(st.id, area, 'Richtig gelöst!'); }
            else { toast('Knapp daneben – versuch es nochmal!', 'warn'); }
          });
          choices.appendChild(b);
        });
        wrap.appendChild(choices); area.appendChild(wrap);
      }

      else if (st.type === 'hold') {
        const secs = st.seconds;
        const wrap = document.createElement('div');
        wrap.innerHTML = `<p>Halte Finger/Maus im Kreis für <strong>${secs}</strong> Sekunden ohne loszulassen.</p>`;
        const ring = document.createElement('div');
        Object.assign(ring.style, { width: '160px', height: '160px', margin: '10px auto', borderRadius: '50%', border: '6px solid rgba(255,255,255,.12)', position: 'relative', touchAction: 'none' });
        const fill = document.createElement('div');
        Object.assign(fill.style, { position: 'absolute', inset: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center' });
        fill.innerHTML = `<div style="font:800 26px/1 Montserrat, sans-serif" id="hold-timer">0</div>`;
        ring.appendChild(fill); wrap.appendChild(ring); area.appendChild(wrap);
        let t = 0, pressing = false, interval = null;
        const reset = () => { t = 0; el('#hold-timer').textContent = '0'; };
        const startCount = () => {
          if (interval) return; interval = setInterval(() => {
            if (!pressing) { clearInterval(interval); interval = null; reset(); return; }
            t++; el('#hold-timer').textContent = String(t);
            if (t >= secs) { clearInterval(interval); interval = null; completeStation(st.id, area, 'Stabil wie ein Brett.'); }
          }, 1000);
        };
        ring.addEventListener('pointerdown', () => { pressing = true; startCount(); });
        ring.addEventListener('pointerup', () => { pressing = false; });
        ring.addEventListener('pointercancel', () => { pressing = false; });
        ring.addEventListener('pointerleave', () => { pressing = false; });
      }

      else if (st.type === 'combo') {
        const wrap = document.createElement('div');
        wrap.innerHTML = `<p>Links ×${st.left}, Rechts ×${st.right} in ${st.seconds} s.</p>`;
        const areaBtns = document.createElement('div');
        Object.assign(areaBtns.style, { display: 'flex', gap: '8px', justifyContent: 'center' });

        const leftB = document.createElement('button'); leftB.className = 'btn'; leftB.textContent = '👊 Links';
        const rightB = document.createElement('button'); rightB.className = 'btn'; rightB.textContent = '🥊 Rechts';
        areaBtns.append(leftB, rightB); wrap.appendChild(areaBtns);

        // >>> Option A: Zoom/Pinch während der Challenge erlauben
        leftB.style.touchAction = 'auto';
        rightB.style.touchAction = 'auto';
        enableZoomForChallenge();

        const prog = document.createElement('p');
        prog.innerHTML = `L: <b id="lcount">0</b> · R: <b id="rcount">0</b> · Zeit: <b id="ctime">${st.seconds}</b>s`;
        wrap.appendChild(prog);
        area.appendChild(wrap);

        let L = 0, R = 0, time = st.seconds, timer = null, started = false;
        const startTimer = () => {
          if (started) return; started = true;
          timer = setInterval(() => {
            time--; el('#ctime').textContent = String(time);
            if (time <= 0) {
              clearInterval(timer); timer = null;
              leftB.disabled = true; rightB.disabled = true;
              restoreViewport(); // ← Zoom zurücksetzen bei Timeout
              toast('Zeit abgelaufen – nochmal!', 'warn');
            }
          }, 1000);
        };

        function check() {
          if (L === st.left && R === st.right) {
            completeStation(st.id, area, 'Saubere Kombi!');
            clearInterval(timer); timer = null;
            leftB.disabled = true; rightB.disabled = true;
            restoreViewport(); // ← Zoom zurücksetzen bei Erfolg
          }
        }

        leftB.addEventListener('click', () => {
          startTimer();
          if (R > 0) { toast('Erst alle Links, dann Rechts!', 'warn'); return; }
          L++; el('#lcount').textContent = String(L); check();
        });
        rightB.addEventListener('click', () => {
          startTimer();
          if (L < st.left) { toast('Erst die drei linken!', 'warn'); return; }
          R++; el('#rcount').textContent = String(R); check();
        });
      }
    }

    function completeStation(id, area, msg) {
      state.stationDone.add(id); save();
      const pill = area.parentElement.querySelector('.pill');
      const startBtn = area.parentElement.querySelector('.btn');
      if (pill) pill.textContent = 'Erledigt';
      if (startBtn) startBtn.disabled = true;
      toast(msg, 'ok'); updateProgress();
    }

    function render37() {
      const cont = el('#challenge37 .challenge-grid');
      if (!cont) return;
      cont.innerHTML = '';
      SPORT_DATA.challenge37.forEach(ch => {
        const card = document.createElement('article');
        card.className = 'mini'; card.dataset.id = ch.id;
        const done = state.challengeDone.has(ch.id);

        if (ch.id === 'clicks37') {
          card.innerHTML = `
            <h4>${ch.title}</h4>
            <p>${ch.description}</p>
            <div class="counter">
              <span class="count" id="c37">0</span>
              <button class="btn" id="btn37" ${done ? 'disabled' : ''}>Klick</button>
            </div>
            <div class="progressline"><b id="cbar" style="width:0%"></b></div>
            <p class="muted" id="ctimeleft">Zeit: ${ch.seconds}s</p>
            <p class="muted" id="rhythm-hint" style="text-align:center;opacity:.85">
              Halte den Rhythmus: <b>100–135&nbsp;ms</b> zwischen Klicks
            </p>`;
          cont.appendChild(card);

          // === Rhythmus-Parameter ===
          const MIN_MS = 100;
          const MAX_MS = 135;

          // State
          let c = 0;
          let started = false;
          let lastTap = 0;

          // Zeitsteuerung (echtzeitbasiert)
          let startTS = 0;          // performance.now() beim Start
          let tickId = null;       // Intervall-ID für Anzeige
          const DURATION_MS = ch.seconds * 1000;

          const btn = card.querySelector('#btn37');
          const barEl = card.querySelector('#cbar');
          const timeEl = card.querySelector('#ctimeleft');
          const countEl = card.querySelector('#c37');

          function pulse(el) {
            el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], {
              duration: 120, easing: 'ease-out'
            });
          }

          function stopClock() {
            if (tickId) { clearInterval(tickId); tickId = null; }
          }

          function resetTry(reason) {
            stopClock();
            started = false;
            c = 0;
            lastTap = 0;
            startTS = 0;
            countEl.textContent = '0';
            barEl.style.width = '0%';
            timeEl.textContent = 'Zeit: ' + ch.seconds + 's';
            btn.disabled = false;
            if (reason) toast(reason, 'warn');
          }

          function startClock() {
            startTS = performance.now();
            // Anzeige alle 100 ms aktualisieren, aber Wert aus echter Zeit ableiten
            tickId = setInterval(() => {
              const elapsed = performance.now() - startTS;
              const remaining = Math.max(0, DURATION_MS - elapsed);
              // Sekunden-Anzeige (ganzzahlig, wie zuvor)
              timeEl.textContent = 'Zeit: ' + Math.ceil(remaining / 1000) + 's';
              if (remaining <= 0) {
                stopClock();
                btn.disabled = true;
                resetTry('Zeit abgelaufen – versuch es erneut.');
              }
            }, 100);
          }

          btn.addEventListener('click', () => {
            if (done || state.challengeDone.has(ch.id)) return;

            const now = performance.now();

            // Erster Klick: Start
            if (!started) {
              started = true;
              startClock();
              lastTap = now;
              c = 1;
              countEl.textContent = '1';
              barEl.style.width = (Math.min(100, Math.round(1 / ch.target * 100))) + '%';
              pulse(btn);
              if (c >= ch.target) {
                finishChallenge(ch.id, card, '37 im Takt! 👏');
                stopClock();
              }
              return;
            }

            // Folge-Klicks: Rhythmusfenster prüfen
            const delta = now - lastTap;
            if (delta < MIN_MS) {
              resetTry('Zu schnell! Rhythmus gebrochen.');
              return;
            }
            if (delta > MAX_MS) {
              resetTry('Zu langsam! Rhythmus verloren.');
              return;
            }

            // gültig
            lastTap = now;
            c++;
            countEl.textContent = String(c);
            barEl.style.width = (Math.min(100, Math.round(c / ch.target * 100))) + '%';
            pulse(btn);

            if (c >= ch.target) {
              finishChallenge(ch.id, card, '37 im Takt! 👏');
              stopClock();
            }
          });
        }



        else if (ch.id === 'moving37') {
          card.innerHTML = `
            <h4>${ch.title}</h4>
            <p>${ch.description}</p>
            <div class="progressline" id="mtbar" style="height:16px">
              <b id="mtnob" style="width:16px; position:absolute; height:16px; border-radius:999px; transform:translateX(0);"></b>
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button class="btn" id="mtstop">Stop</button>
              <span class="pill"><span id="mtval">0</span>%</span>
            </div>`;
          cont.appendChild(card);
          const bar = card.querySelector('#mtbar');
          const nob = card.querySelector('#mtnob');
          const stopBtn = card.querySelector('#mtstop');
          const valOut = card.querySelector('#mtval');
          nob.style.boxShadow = '0 0 20px rgba(0,240,255,.4)';
          bar.style.position = 'relative';
          let x = 0, dir = 1, animId = null, running = true;
          function frame() {
            const width = bar.clientWidth - 16;
            x += dir * (width * 0.008);
            if (x <= 0) { x = 0; dir = 1; }
            if (x >= width) { x = width; dir = -1; }
            nob.style.transform = 'translateX(' + x + 'px)';
            const percent = Math.round((x / width) * 100);
            valOut.textContent = String(percent);
            if (running) animId = requestAnimationFrame(frame);
          }
          frame();
          function stopGame() {
            if (!running) return;
            running = false; cancelAnimationFrame(animId);
            const width = bar.clientWidth - 16;
            const percent = Math.round((x / width) * 100);
            valOut.textContent = String(percent);
            const tol = SPORT_DATA.challenge37.find(k => k.id === 'moving37').tolerance || 1;
            if (Math.abs(percent - 37) <= tol) { finishChallenge(ch.id, card, 'Präzision! 37% getroffen.'); stopBtn.disabled = true; }
            else { toast('Knapp daneben – versuch es erneut.', 'warn'); setTimeout(() => { if (!state.challengeDone.has(ch.id)) { running = true; frame(); } }, 600); }
          }
          stopBtn.addEventListener('click', stopGame);
          bar.addEventListener('click', stopGame);
        }

        else if (ch.id === 'heartrate37') {
          card.innerHTML = `
            <h4>${ch.title}</h4>
            <p>${ch.description}</p>
            <div style="display:grid; place-items:center; min-height:70px;">
              <div id="hrval" style="font:800 28px/1 Montserrat, sans-serif;">—</div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn" id="hrstart">Start</button>
              <button class="btn btn-ghost" id="hrstop" disabled>Stop</button>
            </div>`;
          cont.appendChild(card);
          const v = card.querySelector('#hrval');
          const start = card.querySelector('#hrstart');
          const stop = card.querySelector('#hrstop');
          const min = SPORT_DATA.challenge37.find(k => k.id === 'heartrate37').min || 20;
          const max = SPORT_DATA.challenge37.find(k => k.id === 'heartrate37').max || 60;
          let cur = min, dir = 1, tm = null, running = false;
          function tick() { cur += dir; if (cur >= max) { cur = max; dir = -1; } if (cur <= min) { cur = min; dir = 1; } v.textContent = cur + ' BPM'; }
          start.addEventListener('click', () => { if (running) return; running = true; start.disabled = true; stop.disabled = false; v.textContent = min + ' BPM'; cur = min; dir = 1; tm = setInterval(tick, 70); });
          stop.addEventListener('click', () => {
            if (!running) return; clearInterval(tm); tm = null; running = false; start.disabled = false; stop.disabled = true;
            if (cur === 37) { finishChallenge(ch.id, card, 'Perfekt gestoppt bei 37 BPM.'); start.disabled = true; }
            else { toast('War ' + cur + ' BPM – erneut versuchen!', 'warn'); }
          });
        }
      });
    }

    function finishChallenge(id, card, msg) {
      state.challengeDone.add(id); save();
      toast(msg, 'ok'); updateProgress();
      card.style.outline = '2px solid #00f0ff'; card.style.boxShadow = '0 0 30px rgba(0,240,255,.25)';
      const controls = card.querySelectorAll('button,input,select'); controls.forEach(c => c.disabled = true);
    }

    function toast(text, level) {
      const n = document.createElement('div');
      n.textContent = text;
      Object.assign(n.style, {
        position: 'fixed', left: '50%', top: '20px', transform: 'translateX(-50%)',
        background: level === 'ok' ? '#102a1f' : (level === 'err' ? '#2a1010' : '#2a2410'),
        border: '1px solid rgba(255,255,255,.18)', color: '#e7fff4', padding: '10px 14px', borderRadius: '12px', zIndex: 60,
        boxShadow: '0 10px 30px rgba(0,0,0,.4)'
      });
      document.body.appendChild(n); setTimeout(() => { n.remove(); }, 2000);
    }

    // Badge-Modal
    function openBadgeModal() {
      const dlg = el('#badge-modal');
      const img = el('#badge-img');
      if (img) {
        img.src = 'days/tag5-sport/picSport/badgeGymQueen.png';
        img.onerror = () => { img.alt = 'Badge Bild (days/tag5-sport/picSport/badgeGymQueen.png nicht gefunden)'; };
      }
      if (dlg && !dlg.open) { dlg.showModal(); confettiBurst(); }
    }

    function initControls() {
      el('#badge-close')?.addEventListener('click', () => el('#badge-modal')?.close());
      el('#show-badge')?.addEventListener('click', openBadgeModal);
      el('#reset-progress')?.addEventListener('click', () => {
        if (confirm('Fortschritt wirklich zurücksetzen?')) {
          state.stationDone.clear(); state.challengeDone.clear(); save();
          renderStations(); render37(); const btn = el('#show-badge'); if (btn) btn.disabled = true;
          updateProgress();
          restoreViewport(); // falls gerade Combo aktiv war
        }
      });
    }

    // Direkt initialisieren (kein DOMContentLoaded nötig)
    renderStations(); render37(); initControls(); updateProgress();

    // Teardown (bei Tagwechsel)
    build._teardown = () => {
      try { el('#badge-modal')?.close(); } catch (_) { }
      restoreViewport();
    };
  })();

  // Rückgabe: Teardown-Funktion
  return () => { try { build._teardown?.(); } catch (_) { } };
}
