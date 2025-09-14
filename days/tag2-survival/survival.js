import {
  RULE_OF_THREE,
  B_TOOL_BUCKETS, B_ITEMS, B_RULE, B_HINT,
  WATER_HINT, C1_SIGNS, C2_FILTER_LAYERS, C2_FILTER_ORDER, C3_SCENARIOS, C4_TIPS,
  D_PLANT_PAIRS, D_PLANT_CATEGORIES
} from "./survival_data.js";

/**
 * Tag 2 – Survival
 * A) Regel der 3
 * B) Improvisierte Werkzeuge – Drag&Drop Matching
 * C) Fortgeschritten – Wasserversorgung
 * D) Profi – Pflanzenerkennung (Drag&Drop-Tabelle mit freiem Paaren)
 */
export function build(root, api) {
  root.innerHTML = `
    <section class="card">
      <h2>Survival · Bushcraft Basics</h2>

      <div class="surv-wrap">
        <!-- Step A: Regel der 3 -->
        <div class="step" id="stepA">
          <h3>Grundlagen – Überleben nach Dringlichkeit</h3>
          <p class="hint">Wähle für jede Zeile die <strong>Rangzahl</strong> (1 = dringend, 4 = weniger dringend).</p>
          <div class="order-list" id="orderList"></div>
          <div class="btnrow" style="margin-top:.35rem">
            <button class="btn" id="checkA">Prüfen</button>
          </div>
          <div class="feedback" id="fbA"></div>
        </div>

        <!-- Step B: Improvisierte Werkzeuge -->
        <div class="step" id="stepB">
          <h3>Erweiterte Grundlagen – Improvisierte Werkzeuge</h3>
          <p class="hint">${B_HINT}</p>

          <div class="b-grid">
            <div class="b-bank" id="bBank">
              <h4>Werkzeug-Kärtchen</h4>
              <div id="bChips"></div>
            </div>

            <div class="b-col">
              ${B_TOOL_BUCKETS.map(b => `
                <div class="b-bucket" data-bucket="${b.key}">
                  <h4>${b.label}</h4>
                  <div class="b-drop"></div>
                  <div class="b-meta" id="meta-${b.key}">0 korrekt</div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="btnrow" style="margin-top:.35rem">
            <button class="btn" id="checkB">Prüfen</button>
            <button class="btn ghostbtn" id="resetB">Zurücksetzen</button>
          </div>
          <div class="feedback" id="fbB"></div>
        </div>

        <!-- Step C: Fortgeschritten – Wasser -->
        <div class="step" id="stepC">
          <h3>Fortgeschritten – Wasserversorgung</h3>
          <p class="hint">${WATER_HINT}</p>

          <div id="c1"></div>
          <div id="c2"></div>
          <div id="c3"></div>
          <div id="c4"></div>

          <div class="btnrow" style="margin-top:.35rem">
            <button class="btn" id="checkC">Prüfen</button>
          </div>
          <div class="feedback" id="fbC"></div>
        </div>
      </div> <!-- schließt .surv-wrap -->

      <!-- Step D: Profi – Pflanzenerkennung (Drag & Drop Tabelle) -->
      <div class="step" id="stepD">
        <h3>Profi – Pflanzenerkennung</h3>
        <p class="hint">
          In Deutschland gibt es viele essbare Pflanzen. Doch Vorsicht, viele von denen haben einen giftigen Gegenspieler.
          Ordne die untenstehenden Pflanzen den Kategorien zu.
          Richtig ist eine Zeile, wenn links (Essbar/Heilpflanze) und rechts (Giftiger Doppelgänger) liegen <em>und</em> beide Bilder zum selben Paar gehören.
          </p>

        <!-- Bilderbank -->
        <div id="dBank" class="plant-bank"></div>

        <!-- Tabelle -->
        <div class="plant-table" id="dTable"></div>

        <div class="btnrow" style="margin-top:.35rem">
          <button class="btn" id="checkD">Prüfen</button>
        </div>
        <div class="feedback" id="fbD"></div>
      </div>

      <div id="surv-success">
        <p class="feedback ok"><strong>Stark!</strong> Du hast alle Survival-Checks bestanden. 🏕️</p>
        <div>
          <span class="badge">🧭 Priorisierung</span>
          <span class="badge">🪓 Werkzeuge</span>
          <span class="badge">💧 Wasser</span>
          <span class="badge">🌿 Pflanzen</span>
        </div>
        <div class="campbtn-wrap" id="campBtnWrap"></div>
      </div>
    </section>
  `;

  // --- Hint-Popup für Step D (Pflanzenerkennung) ---
  (function initPlantHintModal(){
    let shown = sessionStorage.getItem("survStepDHintShown") === "1";
    const supportsDialog = typeof HTMLDialogElement !== "undefined" && !!HTMLDialogElement.prototype.showModal;

    // Dialog + (Fallback-)Backdrop bauen
    const dlg = document.createElement("dialog");
    dlg.id = "plant-hint-modal";
    dlg.innerHTML = `
      <article class="ph-card" role="document" aria-labelledby="ph-title">
        <h4 id="ph-title">Profi – Pflanzenerkennung</h4>
        <p class="ph-line">• Bewege die Pflanzen per <strong>Drag &amp; Drop</strong></p>
        <p class="ph-line">• <strong>Bilder tippen</strong> zum Öffnen</p>
        <div class="ph-actions">
          <button class="btn" id="ph-ok">Verstanden</button>
        </div>
      </article>
    `;
    document.body.appendChild(dlg);

    // Fallback-Backdrop (für Browser ohne native ::backdrop)
    let fbBackdrop = null;
    if (!supportsDialog) {
      fbBackdrop = document.createElement("div");
      fbBackdrop.className = "ph-fallback-backdrop";
      document.body.appendChild(fbBackdrop);
    }

    // Open/Close Helpers (mit Fallback)
    const openDlg = () => {
      if (shown) return;
      if (supportsDialog) {
        if (!dlg.open) dlg.showModal();
      } else {
        dlg.setAttribute("open", "");
        fbBackdrop?.classList.add("show");
      }
    };
    const closeDlg = () => {
      if (supportsDialog) dlg.close();
      else { dlg.removeAttribute("open"); fbBackdrop?.classList.remove("show"); }
    };

    // Schließen: Button, Klick neben Karte, ESC
    dlg.querySelector("#ph-ok")?.addEventListener("click", closeDlg);
    dlg.addEventListener("click", (e) => {
      const card = dlg.querySelector(".ph-card")?.getBoundingClientRect();
      if (!card) return;
      if (e.clientX < card.left || e.clientX > card.right || e.clientY < card.top || e.clientY > card.bottom) {
        closeDlg();
      }
    });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDlg(); });
    dlg.addEventListener("close", () => { sessionStorage.setItem("survStepDHintShown", "1"); shown = true; });
    // Fallback "close"-Äquivalent
    if (!supportsDialog) {
      const obsAttr = new MutationObserver(() => {
        if (!dlg.hasAttribute("open")) { sessionStorage.setItem("survStepDHintShown", "1"); shown = true; }
      });
      obsAttr.observe(dlg, { attributes: true, attributeFilter: ["open"] });
    }

    // Intersection Observer – mobiler freundlicher
    const stepD = root.querySelector("#stepD");
    if (!stepD) return;
    const io = new IntersectionObserver((entries) => {
      const ent = entries[0];
      if (ent.isIntersecting && !shown) {
        openDlg();
        io.disconnect();
      }
    }, { threshold: 0.2, rootMargin: "0px 0px -20% 0px" });
    io.observe(stepD);

    // Sicherheitsnetz: erster Tap in Step D öffnet ebenfalls einmalig
    const tapOnce = (ev) => {
      if (!shown) openDlg();
      stepD.removeEventListener("pointerdown", tapOnce, { passive: true });
    };
    stepD.addEventListener("pointerdown", tapOnce, { passive: true });
  })();

  // --- Lightbox (einmalig) ---
  function ensureLightbox() {
    if (document.getElementById("lightbox")) return;
    const lb = document.createElement("div");
    lb.id = "lightbox";
    lb.className = "lightbox";
    lb.innerHTML = `
      <button class="close" aria-label="Schließen">×</button>
      <img class="lightbox-content" id="lightbox-img" alt="">
    `;
    document.body.appendChild(lb);

    const close = () => {
      lb.style.display = "none";
      const im = document.getElementById("lightbox-img");
      if (im) im.removeAttribute("src");
    };
    lb.querySelector(".close").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  function openLightbox(src) {
    ensureLightbox();
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    if (src) img.src = src;
    lb.style.display = "block";
  }

  function setupCampTeaser() {
    const wrap = root.querySelector("#campBtnWrap");
    if (!wrap || wrap.querySelector(".campcard")) return;

    wrap.innerHTML = `
      <article class="campcard" role="region" aria-label="Dein Survival Camp">
        <div class="campcard-media">
          <img src="img/picSurvival.png" alt="Vorschau Survival Camp" loading="lazy">
        </div>
        <div class="campcard-body">
          <h4 class="campcard-title">Dein Survival Camp</h4>
          <p class="campcard-sub">Finale Belohnung – tippe zum Öffnen</p>
          <button class="btn campcard-cta" id="campOpenBtn">Ansehen</button>
        </div>
      </article>
    `;

    const openBtn = wrap.querySelector("#campOpenBtn");
    openBtn.addEventListener("click", () => openLightbox("img/picSurvival.png"));

    // Fokus & Sichtbarkeit erhöhen
    wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    openBtn.focus();
    wrap.classList.add("pulse-once");
  }

  /* ===== Helpers ===== */
  const $ = (s, p = root) => p.querySelector(s);
  const $$ = (s, p = root) => Array.from(p.querySelectorAll(s));
  const markDone = (el, ok = true) => {
    el.classList.toggle("done", ok);
    const fb = el.querySelector(".feedback");
    if (!fb) return;
    fb.className = "feedback " + (ok ? "ok" : "err");
    fb.textContent = ok ? "Korrekt!" : "Nicht ganz – versuch’s noch einmal.";
  };

  // ===== Auto-Scroll beim Drag in Randnähe =====
  const AUTOSCROLL_EDGE = 80;
  const AUTOSCROLL_MAX = 22;

  function autoScrollIfNeeded(clientY) {
    const vh = window.innerHeight;
    let delta = 0;
    if (clientY < AUTOSCROLL_EDGE) {
      const factor = (AUTOSCROLL_EDGE - clientY) / AUTOSCROLL_EDGE;
      delta = -Math.ceil(factor * AUTOSCROLL_MAX);
    } else if ((vh - clientY) < AUTOSCROLL_EDGE) {
      const factor = (AUTOSCROLL_EDGE - (vh - clientY)) / AUTOSCROLL_EDGE;
      delta = Math.ceil(factor * AUTOSCROLL_MAX);
    }
    if (delta !== 0) window.scrollBy(0, delta);
  }

  /* ===== Step A – Regel der 3 ===== */
  const orderList = $("#orderList");
  RULE_OF_THREE.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div style="flex:1">${item.label}</div>
      <label>Rang:
        <select data-key="${item.key}">
          <option value="">–</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </label>
    `;
    orderList.appendChild(row);
  });

  $("#checkA").addEventListener("click", () => {
    const chosen = {};
    let valid = true;
    $$("#orderList select").forEach(sel => {
      const v = sel.value;
      if (!v) { valid = false; }
      chosen[v] = sel.dataset.key;
    });
    if (!valid || Object.keys(chosen).length !== 4) {
      $("#fbA").className = "feedback err";
      $("#fbA").textContent = "Bitte alle Ränge setzen (1–4).";
      return;
    }
    const correct =
      chosen["3"] === "fire" &&
      chosen["1"] === "shelter" &&
      chosen["2"] === "water" &&
      chosen["4"] === "food";
    markDone($("#stepA"), correct);
  });

  /* ===== Step B – Improvisierte Werkzeuge ===== */
  const chipsHost = $("#bChips");
  const buckets = B_TOOL_BUCKETS.map(b => ({ ...b, el: $(`.b-bucket[data-bucket="${b.key}"]`) }));
  const fbB = $("#fbB");

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderChips(list) {
    chipsHost.innerHTML = "";
    list.forEach(it => {
      const chip = document.createElement("div");
      chip.className = "b-chip";
      chip.textContent = it.label;
      chip.dataset.key = it.key;
      chip.dataset.accepts = it.accepts.join(",");
      chipsHost.appendChild(chip);
    });
  }
  renderChips(shuffle([...B_ITEMS]));

  // Drag per Pointer Events
  let drag = { el: null, ox: 0, oy: 0, from: null };

  function onDown(e) {
    const chip = e.target.closest(".b-chip");
    if (!chip) return;
    drag.el = chip;
    drag.from = chip.parentElement;
    const r = chip.getBoundingClientRect();
    drag.ox = e.clientX - r.left;
    drag.oy = e.clientY - r.top;
    chip.style.position = "fixed";
    chip.style.left = r.left + "px";
    chip.style.top = r.top + "px";
    chip.style.zIndex = "9999";
    chip.setPointerCapture?.(e.pointerId);
  }
  function onMove(e) {
    if (!drag.el) return;
    drag.el.style.left = (e.clientX - drag.ox) + "px";
    drag.el.style.top = (e.clientY - drag.oy) + "px";
    autoScrollIfNeeded(e.clientY);
  }
  function onUp(e) {
    if (!drag.el) return;
    drag.el.releasePointerCapture?.(e.pointerId);
    const chip = drag.el;

    // Bucket-Hit testen
    let placed = false;
    for (const b of buckets) {
      const r = b.el.getBoundingClientRect();
      const hit = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (hit) {
        chip.style.position = "";
        chip.style.left = ""; chip.style.top = ""; chip.style.zIndex = "";
        b.el.querySelector(".b-drop").appendChild(chip);
        placed = true;
        break;
      }
    }
    if (!placed) {
      chip.style.position = ""; chip.style.left = ""; chip.style.top = ""; chip.style.zIndex = "";
      chipsHost.appendChild(chip);
    }

    drag.el = null; drag.from = null;
    updateBucketMeta();
  }

  $("#stepB").addEventListener("pointerdown", onDown);
  $("#stepB").addEventListener("pointermove", onMove);
  $("#stepB").addEventListener("pointerup", onUp);
  $("#stepB").addEventListener("pointercancel", onUp);

  function updateBucketMeta() {
    buckets.forEach(b => {
      const items = Array.from(b.el.querySelectorAll(".b-drop .b-chip"));
      const correct = items.filter(ch => {
        const acc = (ch.dataset.accepts || "").split(",").filter(Boolean);
        return acc.includes(b.key);
      }).length;
      b.el.classList.toggle("ok", correct >= (B_RULE.minPerBucket || 1));
      const meta = b.el.querySelector(`#meta-${b.key}`);
      if (meta) meta.textContent = `${correct} korrekt`;
    });
  }

  $("#resetB").addEventListener("click", () => {
    buckets.forEach(b => {
      const drop = b.el.querySelector(".b-drop");
      if (drop) drop.innerHTML = "";
      b.el.classList.remove("ok");
    });
    fbB.className = "feedback"; fbB.textContent = "";
    renderChips(shuffle([...B_ITEMS]));
    updateBucketMeta();
  });

  $("#checkB").addEventListener("click", () => {
    updateBucketMeta();
    const ok = buckets.every(b => b.el.classList.contains("ok"));
    markDone($("#stepB"), ok);
    if (!ok) {
      fbB.className = "feedback err";
      fbB.textContent = `Noch nicht. Pro Kategorie brauchst du mindestens ${B_RULE.minPerBucket} korrekte Zuordnungen.`;
    } else {
      fbB.className = "feedback ok";
      fbB.textContent = "Sauber sortiert! ✅";
    }
  });

  /* ===== Step C – Fortgeschritten: Wasser ===== */
  const c1Host = $("#c1");
  const c2Host = $("#c2");
  const c3Host = $("#c3");
  const c4Host = $("#c4");
  const fbC = $("#fbC");

  /* C-Wrapper: 2-spaltiges Grid (mobil 1-spaltig) */
  (function wrapCAsGrid() {
    const stepC = document.getElementById("stepC");
    const btnRow = stepC.querySelector(".btnrow");
    const grid = document.createElement("div");
    grid.className = "c-grid";
    stepC.insertBefore(grid, btnRow);
    [c1Host, c2Host, c3Host, c4Host].forEach(h => {
      const card = document.createElement("div");
      card.className = "c-card";
      card.appendChild(h);
      grid.appendChild(card);
    });
  })();

  /* C1 — Wasserquellen erkennen (Chip-Toggles) */
  (function renderC1() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `
    <div class="c-head">
      <span class="c-badge">C1</span>
      <h4>Wasserquellen erkennen</h4>
      <p class="c-sub">Wähle alle verlässlichen Anzeichen</p>
    </div>
    <div class="c-chiprow" role="group" aria-label="Anzeichen">
    </div>
  `;
    const chiprow = wrap.querySelector(".c-chiprow");
    C1_SIGNS.forEach(opt => {
      const id = `c1_${opt.key}`;
      const label = document.createElement("label");
      label.className = "c-chip";
      label.setAttribute("for", id);
      label.innerHTML = `
      <input class="choice c-vis" type="checkbox" id="${id}" data-key="${opt.key}">
      <span class="c-chip__label">${opt.label}</span>
    `;
      chiprow.appendChild(label);
    });
    c1Host.innerHTML = "";
    c1Host.appendChild(wrap);
  })();

  /* C2 — Improvisierter Filter (modernisierte Reihenfolge-UI) */
  (function renderC2() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `
    <div class="c-head">
      <span class="c-badge">C2</span>
      <h4>Improvisierter Filter</h4>
      <p class="c-sub">Leere PET-Flasche - Boden abgeschnitten<br>Flasche hängt mit Hals nach unten<br><strong>Ordne die Schichten von Boden -> Hals</strong></p>
    </div>
    <div class="c-order">
      ${C2_FILTER_LAYERS.map(layer => `
        <div class="c-order__row">
          <div class="c-order__label">${layer.label}</div>
          <div class="c-order__sel">
            <select data-key="${layer.key}" class="c-select">
              <option value="">–</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>
      `).join("")}
    </div>
  `;
    c2Host.innerHTML = "";
    c2Host.appendChild(wrap);
  })();

  /* C3 — Szenarien (Card-Radios) */
  (function renderC3() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `
    <div class="c-head">
      <span class="c-badge">C3</span>
      <h4>Welche Methode passt?</h4>
      <p class="c-sub">Tippe die passende Lösung pro Szenario</p>
    </div>
    <div class="c-cards"></div>
  `;
    const list = wrap.querySelector(".c-cards");

    C3_SCENARIOS.forEach(sc => {
      const group = document.createElement("fieldset");
      group.className = "c-scenario";
      const legendText = sc.question;
      group.innerHTML = `<legend class="c-scenario__q">${legendText}</legend>`;

      sc.options.forEach(o => {
        const id = `sc_${sc.key}_${o.key}`;
        const card = document.createElement("label");
        card.className = "c-cardradio";
        card.setAttribute("for", id);
        card.innerHTML = `
        <input class="choice c-vis" type="radio" id="${id}" name="sc_${sc.key}" value="${o.key}">
        <div class="c-cardradio__body">
          <div class="c-cardradio__icon">💧</div>
          <div class="c-cardradio__label">${o.label}</div>
        </div>
      `;
        group.appendChild(card);
      });

      list.appendChild(group);
    });

    c3Host.innerHTML = "";
    c3Host.appendChild(wrap);
  })();

  /* C4 — Tipps/Hacks (Chip-Toggles) */
  (function renderC4() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `
    <div class="c-head">
      <span class="c-badge">C4</span>
      <h4>Wasser – richtig handeln</h4>
      <p class="c-sub">Wähle die korrekten Aussagen</p>
    </div>
    <div class="c-chiprow" role="group" aria-label="Tipps"></div>
  `;
    const chiprow = wrap.querySelector(".c-chiprow");

    C4_TIPS.forEach(opt => {
      const id = `c4_${opt.key}`;
      const label = document.createElement("label");
      label.className = "c-chip";
      label.setAttribute("for", id);
      label.innerHTML = `
      <input class="choice c-vis" type="checkbox" id="${id}" data-key="${opt.key}">
      <span class="c-chip__label">${opt.label}</span>
    `;
      chiprow.appendChild(label);
    });

    c4Host.innerHTML = "";
    c4Host.appendChild(wrap);
  })();

  /* ===== Step C – Auswertung (Prüfen-Button) ===== */
  $("#checkC").addEventListener("click", () => {
    // --- C1 ---
    const chosenC1 = new Set(
      Array.from(c1Host.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.dataset.key)
    );
    const correctC1 = new Set(C1_SIGNS.filter(x => x.correct).map(x => x.key));
    const allC1 = new Set(C1_SIGNS.map(x => x.key));
    const okC1 = [...allC1].every(k => correctC1.has(k) === chosenC1.has(k));

    // --- C2 ---
    const selMap = {};
    let validC2 = true;
    c2Host.querySelectorAll("select[data-key]").forEach(sel => {
      if (!sel.value) validC2 = false;
      selMap[sel.value] = sel.dataset.key;
    });
    const okC2 = validC2 &&
      selMap["1"] === C2_FILTER_ORDER[0] &&
      selMap["2"] === C2_FILTER_ORDER[1] &&
      selMap["3"] === C2_FILTER_ORDER[2] &&
      selMap["4"] === C2_FILTER_ORDER[3];

    // --- C3 ---
    const okC3 = C3_SCENARIOS.every(sc => {
      const selected = (c3Host.querySelector(`input[name="sc_${sc.key}"]:checked`) || {}).value;
      return selected === sc.answer;
    });

    // --- C4 ---
    const chosenC4 = new Set(
      Array.from(c4Host.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.dataset.key)
    );
    const correctC4 = new Set(C4_TIPS.filter(x => x.correct).map(x => x.key));
    const allC4 = new Set(C4_TIPS.map(x => x.key));
    const okC4 = [...allC4].every(k => correctC4.has(k) === chosenC4.has(k));

    const ok = okC1 && okC2 && okC3 && okC4;
    markDone($("#stepC"), ok);

    if (!ok) {
      fbC.className = "feedback err";
      const pieces = [
        okC1 ? null : "C1",
        okC2 ? null : "C2",
        okC3 ? null : "C3",
        okC4 ? null : "C4",
      ].filter(Boolean);
      fbC.textContent = `Noch nicht ganz – prüfe: ${pieces.join(", ")}.`;
    } else {
      fbC.className = "feedback ok";
      fbC.textContent = "Wasser-Check bestanden! 💧";
    }
  });

  /* ===== Step D – Profi: Pflanzenerkennung ===== */
  const dBank = $("#dBank");
  const dTable = $("#dTable");
  const fbD = $("#fbD");

  // Tabelle aufbauen
  (function renderDTable() {
    const header = document.createElement("div");
    header.className = "pt-row pt-head";
    header.innerHTML = `
      <div class="pt-col pt-pair"></div>
      <div class="pt-col pt-headcol">${D_PLANT_CATEGORIES.edible}</div>
      <div class="pt-col pt-headcol">${D_PLANT_CATEGORIES.toxic}</div>
    `;
    dTable.appendChild(header);

    D_PLANT_PAIRS.forEach(pair => {
      const row = document.createElement("div");
      row.className = "pt-row";
      row.dataset.pair = pair.key;
      row.innerHTML = `
        <div class="pt-col pt-pair"><strong>${pair.title}</strong></div>
        <div class="pt-col pt-drop" data-accept="edible">
          <div class="pt-dropinner"><span class="pt-placeholder">hierhin ziehen</span></div>
        </div>
        <div class="pt-col pt-drop" data-accept="toxic">
          <div class="pt-dropinner"><span class="pt-placeholder">hierhin ziehen</span></div>
        </div>
      `;
      dTable.appendChild(row);
    });
  })();

  // Bilderbank aufbauen
  (function renderBank() {
    const items = D_PLANT_PAIRS.flatMap(p => p.items.map(it => ({ ...it, pair: p.key })));
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[items[i], items[j]] = [items[j], items[i]]; }
    items.forEach(it => {
      const card = document.createElement("div");
      card.className = "plant-chip";
      card.dataset.key = it.key;
      card.dataset.pair = it.pair;
      card.dataset.ans = it.category; // "edible" | "toxic"
      card.dataset.label = `${it.label} (${it.latin})`;
      card.innerHTML = `<img loading="lazy" src="${it.src}" alt="${it.label}">`;
      dBank.appendChild(card);
    });
  })();

  // Drag per Pointer Events
  let dDrag = { el: null, ox: 0, oy: 0, from: null, startX: 0, startY: 0 };
  let dDidDrag = false; // <— verhindert Lightbox bei Drag

  function dDown(e) {
    const chip = e.target.closest(".plant-chip");
    if (!chip) return;
    dDidDrag = false;
    dDrag.el = chip;
    dDrag.from = chip.parentElement;
    const r = chip.getBoundingClientRect();
    dDrag.ox = e.clientX - r.left;
    dDrag.oy = e.clientY - r.top;
    dDrag.startX = e.clientX;
    dDrag.startY = e.clientY;
    chip.style.position = "fixed";
    chip.style.left = r.left + "px";
    chip.style.top = r.top + "px";
    chip.style.zIndex = "9999";
    chip.classList.add("dragging");
    chip.setPointerCapture?.(e.pointerId);
  }

  function dMove(e) {
    if (!dDrag.el) return;
    // Ab ~4px Bewegung als Drag werten
    if (!dDidDrag && (Math.abs(e.clientX - dDrag.startX) > 4 || Math.abs(e.clientY - dDrag.startY) > 4)) {
      dDidDrag = true;
    }
    dDrag.el.style.left = (e.clientX - dDrag.ox) + "px";
    dDrag.el.style.top = (e.clientY - dDrag.oy) + "px";
    autoScrollIfNeeded(e.clientY);
  }

  function resetCell(cell) {
    if (!cell || !cell.classList.contains("pt-drop")) return;
    cell.classList.remove("ok", "err", "filled");
    cell.querySelector(".pt-name")?.remove();
    if (!cell.querySelector(".pt-dropinner")) {
      const inner = document.createElement("div");
      inner.className = "pt-dropinner";
      inner.innerHTML = `<span class="pt-placeholder">hierhin ziehen</span>`;
      cell.prepend(inner);
    } else {
      cell.querySelector(".pt-dropinner").innerHTML = `<span class="pt-placeholder">hierhin ziehen</span>`;
    }
  }

  function flashErr(cell) {
    cell.classList.add("err");
    setTimeout(() => cell.classList.remove("err"), 450);
  }

  function getRowCells(row) {
    const cells = $$(".pt-drop", row);
    const edible = cells.find(c => c.dataset.accept === "edible");
    const toxic = cells.find(c => c.dataset.accept === "toxic");
    return { edible, toxic };
  }

  // Zeile ist korrekt, wenn beide Seiten gefüllt und Paar-Keys gleich
  function evaluateRow(row) {
    if (!row || row.classList.contains("pt-head")) return;
    const { edible, toxic } = getRowCells(row);
    const chipE = edible?.querySelector(".plant-chip");
    const chipT = toxic?.querySelector(".plant-chip");

    [edible, toxic].forEach(c => c && c.classList.remove("ok", "err"));

    if (!chipE || !chipT) {
      row.classList.remove("row-ok");
      return;
    }
    const samePair = chipE.dataset.pair === chipT.dataset.pair;
    if (samePair) {
      edible.classList.add("ok");
      toxic.classList.add("ok");
      row.classList.add("row-ok");
    } else {
      edible.classList.add("err");
      toxic.classList.add("err");
      row.classList.remove("row-ok");
    }
  }

  function dUp(e) {
    if (!dDrag.el) return;

    // --- WICHTIGER FIX: Wenn nicht wirklich gezogen wurde, NICHT umhängen ---
    const moved = dDidDrag;

    dDrag.el.releasePointerCapture?.(e.pointerId);
    const chip = dDrag.el;

    // Styles zurücksetzen & Drag-Ende markieren
    chip.style.position = ""; chip.style.left = ""; chip.style.top = ""; chip.style.zIndex = "";
    chip.classList.remove("dragging");

    if (!moved) {
      // Nur Tap/Klick: nichts verschieben – Lightbox darf danach öffnen
      dDrag.el = null; dDrag.from = null;
      // dDidDrag bleibt false, damit der Click-Handler die Lightbox öffnet
      return;
    }

    const drops = $$(".pt-drop", dTable);
    let placed = false, targetCell = null;

    for (const cell of drops) {
      const r = cell.getBoundingClientRect();
      const hit = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!hit) continue;

      const okCat = (cell.dataset.accept === chip.dataset.ans); // nur Spaltenregel
      targetCell = cell;
      placed = true;

      if (!okCat) {
        flashErr(cell);
        break;
      }

      // Wenn Zelle belegt: altes Bild in Bank und Zelle sauber resetten
      const already = cell.querySelector(".plant-chip");
      if (already) {
        dBank.appendChild(already);
        resetCell(cell);
      }

      // platzieren
      cell.querySelector(".pt-dropinner")?.remove();
      cell.appendChild(chip);
      cell.classList.add("filled");

      // Namen anzeigen
      let name = cell.querySelector(".pt-name");
      if (!name) {
        name = document.createElement("div");
        name.className = "pt-name";
        cell.appendChild(name);
      }
      name.textContent = chip.dataset.label;

      break;
    }

    if (!placed) {
      // zurück an Ursprung, aber OHNE Reihenfolge zu verändern: wenn aus Bank, zurück an gleiche Position
      // (vereinfachend: zurück in Bank ans Ende)
      dBank.appendChild(chip);
      if (dDrag.from && dDrag.from.classList?.contains("pt-drop")) {
        resetCell(dDrag.from);
        evaluateRow(dDrag.from.closest(".pt-row"));
      }
    }

    if (targetCell) {
      evaluateRow(targetCell.closest(".pt-row"));
    }

    dDrag.el = null; dDrag.from = null;
    // nach Up Drag-Flag zurücksetzen
    setTimeout(() => { dDidDrag = false; }, 0);
  }

  $("#stepD").addEventListener("pointerdown", dDown);
  $("#stepD").addEventListener("pointermove", dMove);
  $("#stepD").addEventListener("pointerup", dUp);
  $("#stepD").addEventListener("pointercancel", dUp);

  // Klick/Tap auf Pflanzenbild = Lightbox öffnen
  $("#stepD").addEventListener("click", (e) => {
    const img = e.target.closest(".plant-chip img");
    if (!img) return;
    if (dDidDrag) { dDidDrag = false; return; }
    openLightbox(img.getAttribute("src"));
  });

  // Prüfen-Button
  $("#checkD").addEventListener("click", () => {
    const rows = $$(".pt-row", dTable).filter(r => !r.classList.contains("pt-head"));
    let allFilled = true, allOk = true;

    rows.forEach(row => {
      evaluateRow(row);
      const { edible, toxic } = getRowCells(row);
      const filledRow = !!(edible.querySelector(".plant-chip") && toxic.querySelector(".plant-chip"));
      allFilled = allFilled && filledRow;
      allOk = allOk && row.classList.contains("row-ok");
    });

    if (!allFilled) {
      fbD.className = "feedback err";
      fbD.textContent = "Bitte fülle jede Zeile mit je 1 essbaren und 1 giftigen Bild.";
      markDone($("#stepD"), false);
    } else if (!allOk) {
      fbD.className = "feedback err";
      fbD.textContent = "Einige Zeilen bilden kein korrektes Paar. Tausche die Bilder so, dass essbar + giftig vom selben Paar sind.";
      markDone($("#stepD"), false);
    } else {
      fbD.className = "feedback ok";
      fbD.textContent = "Perfekt! Alle Paare sind korrekt zugeordnet. 🌿";
      markDone($("#stepD"), true);
    }
  });

  /* ===== Gesamterfolg ===== */
  const checkAll = () => {
    const allOk = ["stepA", "stepB", "stepC", "stepD"].every(id => $("#" + id).classList.contains("done"));
    if (allOk) {
      $("#surv-success").classList.add("show");
      setupCampTeaser();
      api.solved();
    }
  };
  ["stepA", "stepB", "stepC", "stepD"].forEach(id => {
    const el = $("#" + id);
    const obs = new MutationObserver(checkAll);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  return () => { };
}
