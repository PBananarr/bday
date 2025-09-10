import { RULE_OF_THREE, RULE_OF_THREE_ORDER, TINDER_OPTIONS, MORSE_HINT, MORSE_ANSWER } from "./survival_data.js";

/**
 * Tag 2 – Survival (3 Mini-Tasks).
 * build(root, api) rendert UI; ruft api.solved() auf, wenn alle drei Aufgaben korrekt sind.
 */
export function build(root, api){
  root.innerHTML = `
    <section class="card">
      <h2>Survival · Bushcraft Basics</h2>

      <div class="surv-wrap">
        <!-- Step A: Regel der 3 -->
        <div class="step" id="stepA">
          <h3>A) Regel der 3 – ordne nach Dringlichkeit</h3>
          <p class="hint">Wähle für jede Zeile die <strong>Rangzahl</strong> (1 = dringend, 4 = weniger dringend).</p>
          <div class="order-list" id="orderList"></div>
          <div class="btnrow" style="margin-top:.35rem">
            <button class="btn" id="checkA">Prüfen</button>
          </div>
          <div class="feedback" id="fbA"></div>
        </div>

        <!-- Step B: Zunder im Regen -->
        <div class="step" id="stepB">
          <h3>B) Feuer im Regen – wähle 2 geeignete Zunder</h3>
          <div class="selector" id="tinderSel"></div>
          <div class="btnrow" style="margin-top:.35rem">
            <button class="btn" id="checkB">Prüfen</button>
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
  const $ = (s, p=root) => p.querySelector(s);
  const $$ = (s, p=root) => Array.from(p.querySelectorAll(s));
  const markDone = (el, ok=true) => {
    el.classList.toggle("done", ok);
    const fb = el.querySelector(".feedback");
    if(!fb) return;
    fb.className = "feedback " + (ok ? "ok" : "err");
    fb.textContent = ok ? "Korrekt!" : "Nicht ganz – versuch’s noch einmal.";
  };

  /* ===== Step A – Regel der 3 ===== */
  const orderList = $("#orderList");
  RULE_OF_THREE.forEach((item, idx)=>{
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

  $("#checkA").addEventListener("click", ()=>{
    const chosen = {};
    let valid = true;
    $$("#orderList select").forEach(sel=>{
      const v = sel.value;
      if(!v){ valid=false; }
      chosen[v] = sel.dataset.key;
    });
    if(!valid || Object.keys(chosen).length !== 4){
      $("#fbA").className="feedback err";
      $("#fbA").textContent="Bitte alle Ränge setzen (1–4).";
      return;
    }
    // Prüfen: 1→air, 2→shelter, 3→water, 4→food
    const correct =
      chosen["1"]==="air" &&
      chosen["2"]==="shelter" &&
      chosen["3"]==="water" &&
      chosen["4"]==="food";

    markDone($("#stepA"), correct);
  });

  /* ===== Step B – Zunderwahl ===== */
  const selWrap = $("#tinderSel");
  TINDER_OPTIONS.forEach(opt=>{
    const label = document.createElement("label");
    label.className = "choice";
    label.innerHTML = `<input type="checkbox" value="${opt.key}"> ${opt.label}`;
    selWrap.appendChild(label);
  });

  $("#checkB").addEventListener("click", ()=>{
    const picks = $$("#tinderSel input:checked").map(i=>i.value);
    if(picks.length !== 2){
      $("#fbB").className="feedback err";
      $("#fbB").textContent="Bitte wähle genau 2 Optionen.";
      return;
    }
    const correctKeys = TINDER_OPTIONS.filter(o=>o.correct).map(o=>o.key).sort().join(",");
    const pickKeys = picks.sort().join(",");
    const ok = (pickKeys === correctKeys);
    markDone($("#stepB"), ok);
    if(!ok){
      $("#fbB").textContent = "Nicht ganz. Tipp: Harz/Öle & trockene Schichten helfen auch bei Nässe.";
    }
  });

  /* ===== Step C – Morse ===== */
  $("#morseForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const val = (new FormData(e.currentTarget).get("morse")||"").toString().trim().toLowerCase();
    const ok = (val === MORSE_ANSWER);
    markDone($("#stepC"), ok);
    if(!ok){
      $("#fbC").textContent = "Tipp: Internationales Notsignal.";
    }
  });

  /* ===== Gesamterfolg ===== */
  const checkAll = ()=> {
    const allOk = ["stepA","stepB","stepC"].every(id => $("#"+id).classList.contains("done"));
    if(allOk){
      $("#surv-success").classList.add("show");
      api.solved();
    }
  };

  // Beobachte Veränderungen und prüfe finalen Zustand
  ["stepA","stepB","stepC"].forEach(id=>{
    const el = $("#"+id);
    const obs = new MutationObserver(checkAll);
    obs.observe(el, { attributes:true, attributeFilter:["class"] });
  });

  // Cleanup (nichts Spezielles hier)
  return () => {};
}
