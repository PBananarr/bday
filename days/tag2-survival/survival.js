import {
  RULE_OF_THREE, RULE_OF_THREE_ORDER,
  B_TOOL_BUCKETS, B_ITEMS, B_RULE, B_HINT,
  MORSE_HINT, MORSE_ANSWER
} from "./survival_data.js";

/**
 * Tag 2 – Survival
 * A) Regel der 3 (unverändert)
 * B) NEU: Improvisierte Werkzeuge – Drag&Drop Matching
 * C) Morse (unverändert)
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

        <!-- Step B: Improvisierte Werkzeuge (NEU) -->
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

        <!-- Step C: Notsignal -->
        <div class="step" id="stepC">
          <h3>C) Notsignal – Morse</h3>
          <p class="hint">Was bedeutet <code>${MORSE_HINT}</code>?</p>
          <form id="morseForm">
            <input class="choice riddle-input" name="morse" placeholder="Antwort eingeben …" autocomplete="off" inputmode="text" />
            <div class="btnrow" style="margin-top:.35rem">
              <button class="btn" type="submit">Prüfen</button>
            </div>
          </form>
          <div class="feedback" id="fbC"></div>
        </div>
      </div>

      <div id="surv-success">
        <p class="feedback ok"><strong>Stark!</strong> Du hast alle Survival-Checks bestanden. 🏕️</p>
        <div>
          <span class="badge">🧭 Orientierung</span>
          <span class="badge">🔥 Feuer</span>
          <span class="badge">📡 Signal</span>
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

  /* ===== Step A – Regel der 3 (wie bei dir) ===== */
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
    // (Deine aktuelle Logik behalten)
    const correct =
      chosen["3"] === "fire" &&
      chosen["1"] === "shelter" &&
      chosen["2"] === "water" &&
      chosen["4"] === "food";
    markDone($("#stepA"), correct);
  });

  /* ===== Step B – Improvisierte Werkzeuge (NEU) ===== */
  const bank = $("#bBank");
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

  // Chips anlegen
  B_ITEMS.forEach(it => {
    const chip = document.createElement("div");
    chip.className = "b-chip";
    chip.textContent = it.label;
    chip.dataset.key = it.key;
    chip.dataset.accepts = it.accepts.join(",");
    chipsHost.appendChild(chip);
  });

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
    Array.from($("#stepB").querySelectorAll(".b-chip")).forEach(ch => chipsHost.appendChild(ch));
    buckets.forEach(b => b.el.classList.remove("ok"));
    fbB.className = "feedback"; fbB.textContent = "";
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

  /* ===== Step C – Morse (wie bei dir) ===== */
  $("#morseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (new FormData(e.currentTarget).get("morse") || "").toString().trim().toLowerCase();
    const ok = (val === MORSE_ANSWER);
    markDone($("#stepC"), ok);
    if (!ok) {
      $("#fbC").textContent = "Tipp: Internationales Notsignal.";
    }
  });

  /* ===== Gesamterfolg ===== */
  const checkAll = () => {
    const allOk = ["stepA", "stepB", "stepC"].every(id => $("#" + id).classList.contains("done"));
    if (allOk) {
      $("#surv-success").classList.add("show");
      api.solved();
    }
  };

  // Beobachte Veränderungen und prüfe finalen Zustand
  ["stepA", "stepB", "stepC"].forEach(id => {
    const el = $("#" + id);
    const obs = new MutationObserver(checkAll);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  return () => { };
}
