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
 */
export function build(root, api) {
  root.innerHTML = `
    <section class="card">
      <h2>Survival · Bushcraft Basics</h2>

      <div class="surv-wrap">
        <!-- Step A: Regel der 3 -->
        <div class="step" id="stepA">
          <h3>A) Grundlagen – Überleben nach Dringlichkeit</h3>
          <p class="hint">Wähle für jede Zeile die <strong>Rangzahl</strong> (1 = dringend, 4 = weniger dringend).</p>
          <div class="order-list" id="orderList"></div>
          <div class="btnrow" style="margin-top:.35rem">
            <button class="btn" id="checkA">Prüfen</button>
          </div>
          <div class="feedback" id="fbA"></div>
        </div>

        <!-- Step B: Improvisierte Werkzeuge -->
        <div class="step" id="stepB">
          <h3>B) Erweiterte Grundlagen – Improvisierte Werkzeuge</h3>
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
          <h3>C) Fortgeschritten – Wasserversorgung</h3>
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
        <h3>D) Profi – Pflanzenerkennung</h3>
        <p class="hint">Ziehe die Bilder in die passende Spalte. Stimmt die Zuordnung, erscheint der Pflanzenname.</p>

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
          <span class="badge">🧭 Orientierung</span>
          <span class="badge">🔥 Feuer</span>
          <span class="badge">💧 Wasser</span>
        </div>
      </div>
    </section>
  `;

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
    // Behalte deine bestehende Logik
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

  // Chips rendern (damit wir beim Reset neu mischen können)
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
  renderChips(shuffle([...B_ITEMS])); // initial gemischt

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
      // zurück in Bank
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
    // Buckets leeren & Status zurücksetzen
    buckets.forEach(b => {
      const drop = b.el.querySelector(".b-drop");
      if (drop) drop.innerHTML = "";
      b.el.classList.remove("ok");
    });
    fbB.className = "feedback"; fbB.textContent = "";

    // Bank neu & gemischt aufbauen
    renderChips(shuffle([...B_ITEMS]));
    updateBucketMeta();
  });

  $("#checkB").addEventListener("click", () => {
    // Prüfkriterium: Jeder Bucket >= minPerBucket korrekte Items
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

  // C1 — Anzeichen (Checkboxen)
  (function renderC1() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `<h4 style="margin:.4rem 0;">C1) Wasserquellen erkennen – wähle alle verlässlichen Anzeichen</h4>`;
    C1_SIGNS.forEach(opt => {
      const id = `c1_${opt.key}`;
      const row = document.createElement("label");
      row.style.display = "block";
      row.style.margin = ".25rem 0";
      row.innerHTML = `
        <input class="choice" type="checkbox" id="${id}" data-key="${opt.key}">
        <span>${opt.label}</span>
      `;
      wrap.appendChild(row);
    });
    c1Host.appendChild(wrap);
  })();

  // C2 — Filter bauen (Reihenfolge 1..4)
  (function renderC2() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `<h4 style="margin:.6rem 0 .3rem;">C2) Improvisierter Filter – ordne die Schichten (1 = oben / zuerst)</h4>`;
    const list = document.createElement("div");
    list.className = "order-list";
    C2_FILTER_LAYERS.forEach(layer => {
      const row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML = `
        <div style="flex:1">${layer.label}</div>
        <label>Rang:
          <select data-key="${layer.key}">
            <option value="">–</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>
      `;
      list.appendChild(row);
    });
    wrap.appendChild(list);
    c2Host.appendChild(wrap);
  })();

  // C3 — Szenarien (Radio)
  (function renderC3() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `<h4 style="margin:.6rem 0 .3rem;">C3) Welche Methode passt zum Szenario?</h4>`;
    C3_SCENARIOS.forEach(sc => {
      const block = document.createElement("div");
      block.style.border = "1px solid var(--border)";
      block.style.borderRadius = "10px";
      block.style.padding = ".6rem";
      block.style.margin = ".35rem 0";
      const name = `sc_${sc.key}`;
      const opts = sc.options.map(o => `
        <label style="display:block;margin:.2rem 0;">
          <input class="choice" type="radio" name="${name}" value="${o.key}">
          <span>${o.label}</span>
        </label>
      `).join("");
      block.innerHTML = `<div style="margin-bottom:.35rem">${sc.question}</div>${opts}`;
      wrap.appendChild(block);
    });
    c3Host.appendChild(wrap);
  })();

  // C4 — Tipps/Hacks (Checkboxen)
  (function renderC4() {
    const wrap = document.createElement("div");
    wrap.className = "step-sub";
    wrap.innerHTML = `<h4 style="margin:.6rem 0 .3rem;">C4) Wähle die korrekten Aussagen</h4>`;
    C4_TIPS.forEach(opt => {
      const id = `c4_${opt.key}`;
      const row = document.createElement("label");
      row.style.display = "block";
      row.style.margin = ".25rem 0";
      row.innerHTML = `
        <input class="choice" type="checkbox" id="${id}" data-key="${opt.key}">
        <span>${opt.label}</span>
      `;
      wrap.appendChild(row);
    });
    c4Host.appendChild(wrap);
  })();

  // Prüfen
  $("#checkC").addEventListener("click", () => {
    // C1 auswerten
    const chosenC1 = new Set(
      Array.from(c1Host.querySelectorAll('input[type="checkbox"]:checked'))
        .map(i => i.dataset.key)
    );
    const correctC1 = new Set(C1_SIGNS.filter(x => x.correct).map(x => x.key));
    const allC1 = new Set(C1_SIGNS.map(x => x.key));
    const okC1 = [...allC1].every(k => correctC1.has(k) === chosenC1.has(k));

    // C2 auswerten
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

    // C3 auswerten
    const okC3 = C3_SCENARIOS.every(sc => {
      const selected = (c3Host.querySelector(`input[name="sc_${sc.key}"]:checked`) || {}).value;
      return selected === sc.answer;
    });

    // C4 auswerten
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

  /* ===== Step D – Profi: Pflanzenerkennung (Drag & Drop) ===== */
  const dBank = $("#dBank");
  const dTable = $("#dTable");
  const fbD = $("#fbD");

  // Tabelle aufbauen (Headerzeile + Paare)
  (function renderDTable() {
    // Header
    const header = document.createElement("div");
    header.className = "pt-row pt-head";
    header.innerHTML = `
    <div class="pt-col pt-pair"></div>
    <div class="pt-col pt-headcol">${D_PLANT_CATEGORIES.edible}</div>
    <div class="pt-col pt-headcol">${D_PLANT_CATEGORIES.toxic}</div>
  `;
    dTable.appendChild(header);

    // Paare
    D_PLANT_PAIRS.forEach(pair => {
      const row = document.createElement("div");
      row.className = "pt-row";
      row.dataset.pair = pair.key;
      row.innerHTML = `
      <div class="pt-col pt-pair"><strong>${pair.title}</strong></div>
      <div class="pt-col pt-drop" data-pair="${pair.key}" data-accept="edible">
        <div class="pt-dropinner"><span class="pt-placeholder">hierhin ziehen</span></div>
      </div>
      <div class="pt-col pt-drop" data-pair="${pair.key}" data-accept="toxic">
        <div class="pt-dropinner"><span class="pt-placeholder">hierhin ziehen</span></div>
      </div>
    `;
      dTable.appendChild(row);
    });
  })();

  // Bilderbank aufbauen (alle Items gemischt)
  (function renderBank() {
    const items = D_PLANT_PAIRS.flatMap(p => p.items.map(it => ({ ...it, pair: p.key })));
    // Shuffle
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

  // --- Drag per Pointer Events (wie in Step B) ---
  let dDrag = { el: null, ox: 0, oy: 0 };

  function dDown(e) {
    const chip = e.target.closest(".plant-chip");
    if (!chip) return;
    dDrag.el = chip;
    const r = chip.getBoundingClientRect();
    dDrag.ox = e.clientX - r.left;
    dDrag.oy = e.clientY - r.top;
    chip.style.position = "fixed";
    chip.style.left = r.left + "px";
    chip.style.top = r.top + "px";
    chip.style.zIndex = "9999";
    chip.classList.add("dragging");
    chip.setPointerCapture?.(e.pointerId);
  }
  function dMove(e) {
    if (!dDrag.el) return;
    dDrag.el.style.left = (e.clientX - dDrag.ox) + "px";
    dDrag.el.style.top = (e.clientY - dDrag.oy) + "px";
  }
  function dUp(e) {
    if (!dDrag.el) return;
    dDrag.el.releasePointerCapture?.(e.pointerId);
    const chip = dDrag.el;

    // Drop-Ziele checken
    const drops = $$(".pt-drop", dTable);
    let placed = false, correct = false, targetCell = null;

    for (const cell of drops) {
      const r = cell.getBoundingClientRect();
      const hit = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!hit) continue;

      // Regel: Bild muss in die Zelle seines Paares & akzeptierte Kategorie
      const okPair = (cell.dataset.pair === chip.dataset.pair);
      const okCat = (cell.dataset.accept === chip.dataset.ans);

      if (okPair && okCat) {
        correct = true;
        targetCell = cell;
      } else {
        targetCell = cell; // gemerkt für „falsch“-Feedback
      }
      placed = true;
      break;
    }

    // zurücksetzen Position
    chip.style.position = ""; chip.style.left = ""; chip.style.top = ""; chip.style.zIndex = "";
    chip.classList.remove("dragging");

    if (!placed) {
      // zurück in Bank
      dBank.appendChild(chip);
    } else if (correct) {
      const inner = targetCell.querySelector(".pt-dropinner");
      inner.innerHTML = "";           // Platzhalter weg
      inner.appendChild(chip);        // Bild in Zelle
      targetCell.classList.add("ok"); // grün markieren

      // Namen anzeigen
      let name = targetCell.querySelector(".pt-name");
      if (!name) {
        name = document.createElement("div");
        name.className = "pt-name";
        targetCell.appendChild(name);
      }
      name.textContent = chip.dataset.label;
    } else {
      // falsches Feld → kurzer Fehlerblitz + zurück in Bank
      targetCell?.classList.add("err");
      setTimeout(() => targetCell?.classList.remove("err"), 450);
      dBank.appendChild(chip);
    }

    dDrag.el = null;
  }

  $("#stepD").addEventListener("pointerdown", dDown);
  $("#stepD").addEventListener("pointermove", dMove);
  $("#stepD").addEventListener("pointerup", dUp);
  $("#stepD").addEventListener("pointercancel", dUp);

  // Prüfen-Button
  $("#checkD").addEventListener("click", () => {
    // Pro Paar: beide Zellen gefüllt & ok
    const rows = $$(".pt-row", dTable).filter(r => !r.classList.contains("pt-head"));
    let allOk = true, allFilled = true;

    rows.forEach(row => {
      const drops = $$(".pt-drop", row);
      const okRow = drops.every(c => c.classList.contains("ok"));
      const filledRow = drops.every(c => c.querySelector(".plant-chip"));
      row.classList.toggle("row-ok", okRow);
      if (!okRow) allOk = false;
      if (!filledRow) allFilled = false;
    });

    if (!allFilled) {
      fbD.className = "feedback err";
      fbD.textContent = "Bitte ordne alle Bilder zu (je Paar beide Spalten).";
      markDone($("#stepD"), false);
    } else if (!allOk) {
      fbD.className = "feedback err";
      fbD.textContent = "Einige Zuordnungen sind noch falsch – prüfe die Doppelgänger.";
      markDone($("#stepD"), false);
    } else {
      fbD.className = "feedback ok";
      fbD.textContent = "Top! Alle Pflanzen richtig zugeordnet. 🌿";
      markDone($("#stepD"), true);
    }
  });


  /* ===== Gesamterfolg ===== */
  const checkAll = () => {
    const allOk = ["stepA", "stepB", "stepC", "stepD"].every(id => $("#" + id).classList.contains("done"));
    if (allOk) {
      $("#surv-success").classList.add("show");
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
