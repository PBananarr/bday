/* ====== Kalender & Konfiguration ====== */
const BIRTHDAY_ISO = "2025-09-23T00:00:00+02:00";
export const DAYS = [
  { key: "tag1-sternbild", date: "2025-09-17", title: "Tag 1 · Sternbild", badge: "🪴 Pflanzen-Profi" },
  { key: "tag2-survival", date: "2025-09-18", title: "Tag 2 · Survival", badge: "🧭 Survivalistin" },
  { key: "tag3-escape", date: "2025-09-19", title: "Tag 3 · Sunny-Meadow", badge: "👻 Mutig" },
  { key: "tag4-horror", date: "2025-09-20", title: "Tag 4 · FINDE-UNS", badge: "🩸 Verrückt" },
  { key: "tag5-sport", date: "2025-09-21", title: "Tag 5 · Sport-Boost", badge: "💪 Durchzieherin" },
  { key: "tag6-puzzle", date: "2025-09-22", title: "Tag 6 · Saufnässchen", badge: "🍾 Wein-Liebhaberin" },
  { key: "tag7-finale", date: "2025-09-23", title: "Tag 7 · Finale", badge: "🎖️ Missionsabschluss" }
];
const TOTAL = DAYS.length;
const DEV = new URLSearchParams(location.search).get("dev") === "1";

/* ====== State ====== */
const qs = s => document.querySelector(s);
const state = JSON.parse(localStorage.getItem("bdayModState") || "{}");
const save = () => localStorage.setItem("bdayModState", JSON.stringify(state));
function setDone(key) { state[key] = true; save(); renderNav(); renderProgress(); maybeShowFinal(); }

/* ====== Zeit / Freischaltung ====== */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function unlockedIndex() {
  if (DEV) return DAYS.length - 1;
  const t = todayISO(); let idx = -1;
  for (let i = 0; i < DAYS.length; i++) if (DAYS[i].date <= t) idx = i;
  return Math.max(idx, -1);
}

/* ====== Countdown ====== */
function tickCountdown() {
  const out = qs("#countdown");
  const target = new Date(BIRTHDAY_ISO).getTime();
  let delta = Math.max(0, target - Date.now());
  const d = Math.floor(delta / 86400000); delta -= d * 86400000;
  const h = Math.floor(delta / 3600000); delta -= h * 3600000;
  const m = Math.floor(delta / 60000); delta -= m * 60000;
  const s = Math.floor(delta / 1000);
  out.textContent = `${d}T ${h}h ${m}m ${s}s`;
}

/* ====== Navigation ====== */
let currentIndex = Math.max(0, Math.min(unlockedIndex(), DAYS.length - 1));
function renderNav() {
  const nav = qs("#dayNav");
  nav.innerHTML = "";
  const uIdx = unlockedIndex();
  DAYS.forEach((d, i) => {
    const dot = document.createElement("button");
    dot.className = "daydot" + (i <= uIdx ? " unlocked" : "") + (state[d.key] ? " done" : "") + (i === currentIndex ? " active" : "");
    dot.setAttribute("aria-label", `${d.title} (${d.date})`);
    dot.disabled = i > uIdx;
    dot.addEventListener("click", () => { currentIndex = i; mount(); });
    nav.appendChild(dot);
  });
  qs("#devBadge").hidden = !DEV;
  qs("#dayLabel").textContent = `${DAYS[currentIndex].title} · ${DAYS[currentIndex].date}`;
  qs("#prevDay").disabled = currentIndex <= 0;
  qs("#nextDay").disabled = currentIndex >= Math.min(uIdx, DAYS.length - 1);
}
function renderProgress() {
  const done = DAYS.filter(d => state[d.key]).length;
  qs("#totalCount").textContent = TOTAL;
  qs("#doneCount").textContent = done;
  qs("#progress").style.width = `${(done / TOTAL) * 100}%`;
}

/* ====== Finale ====== */
function badgesRender() {
  const wrap = qs("#badges");
  wrap.innerHTML = "";
  DAYS.forEach(d => {
    const el = document.createElement("span");
    el.className = "badge";
    el.textContent = (state[d.key] ? "✔ " : "• ") + d.badge;
    wrap.appendChild(el);
  });
}
function confetti(count = 120) {
  const cont = qs("#confetti");
  const colors = ["#34d399", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#f87171"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = "-10vh";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    const dur = 2.5 + Math.random() * 2.5, delay = Math.random() * 0.8;
    p.style.animationDuration = dur + "s"; p.style.animationDelay = delay + "s";
    cont.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000 + 500);
  }
}

/*
  Finale anzeigen NUR wenn:
  - alle Tage 1–6 erledigt sind (state[tagX] === true)
  - UND ein expliziter Trigger gesetzt wurde (state.__finalTrigger === true)
*/
function maybeShowFinal() {
  const allDone = DAYS.every(d => state[d.key]);
  const triggered = !!state.__finalTrigger;
  const final = qs("#final");

  if (allDone && triggered && final.hidden) {
    final.hidden = false;
    badgesRender();
    confetti();
  } else if (!(allDone && triggered) && !final.hidden) {
    final.hidden = true;
  }
}

/* Globale Reaktion auf den Tag-7-Klick (wird aus finale.js gefeuert) */
window.addEventListener("final:trigger", () => {
  state.__finalTrigger = true; // persistenter Trigger
  save();
  maybeShowFinal();
});

/* ====== Day Loader (dynamic import + CSS Umschalten) ====== */
let currentCleanup = null;
async function loadDay(i) {
  const host = qs("#dayHost");
  host.innerHTML = "";

  // Sperre für Zukunftstage
  const uIdx = unlockedIndex();
  if (i > uIdx) {
    host.innerHTML = `<section class="card lock">
      <h2>🔒 ${DAYS[i].title}</h2>
      <p>Dieses Rätsel wird am <strong>${DAYS[i].date}</strong> freigeschaltet.</p>
    </section>`;
    setBodyTagClass(null);
    qs("#day-style").href = "";
    return;
  }

  // Stylesheet umschalten
  const base = short(DAYS[i].key);
  qs("#day-style").href = `days/${DAYS[i].key}/${base}.css?v=${cacheBust()}`;

  // Body-Klasse pro Tag für Themes
  setBodyTagClass(DAYS[i].key);

  // Vorherige Ressourcen säubern
  if (typeof currentCleanup === "function") { try { currentCleanup(); } catch { } }
  currentCleanup = null;

  // Modul laden
  try {
    const mod = await import(`../days/${DAYS[i].key}/${base}.js?v=${cacheBust()}`);
    const api = { solved: () => setDone(DAYS[i].key) };
    const cleanup = await mod.build(host, api);
    currentCleanup = typeof cleanup === "function" ? cleanup : null;
  } catch (err) {
    console.warn("Tagesmodul fehlt oder Fehler:", err);
    host.innerHTML = `<section class="card lock">
      <h2>${DAYS[i].title}</h2>
      <p>Dieses Tages-Rätsel ist noch nicht bereit. (Datei: <code>${base}.js</code>)</p>
    </section>`;
    qs("#day-style").href = "";
  }
}

function setBodyTagClass(tagKey) {
  // entferne alle tag- Klassen und setze neue
  document.body.className = document.body.className.split(" ").filter(c => !c.startsWith("tag-")).join(" ").trim();
  if (tagKey) document.body.classList.add(`tag-${tagKey}`);
}
function short(key) { return key.split("-")[1]; }
function cacheBust() { return state.__v || (state.__v = Date.now(), save(), state.__v); }

/* ====== Aktionen ====== */
function initActions() {
  qs("#prevDay").addEventListener("click", () => { currentIndex = Math.max(0, currentIndex - 1); mount(); });
  qs("#nextDay").addEventListener("click", () => { currentIndex = Math.min(unlockedIndex(), currentIndex + 1); mount(); });
  qs("#resetBtn").addEventListener("click", () => { localStorage.removeItem("bdayModState"); location.reload(); });
  qs("#replayBtn").addEventListener("click", () => { localStorage.removeItem("bdayModState"); location.reload(); });
  qs("#shareBtn").addEventListener("click", async () => {
  const text = "Ich habe die Geburtstags-Quest gelöst! 🎉";
  const url = location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: document.title, text, url });
    } catch (e) { /* noop */ }
  } else {
    navigator.clipboard?.writeText(url);
    alert("Link kopiert!");
  }
});
  qs("#aboutBtn").addEventListener("click", () => qs("#about").showModal());
}

/* ====== Footer-Button „Autocomplete 1–6“ ======
   Sichtbar wenn:
   - ?dev=1  (wie bisher), ODER
   - Datum >= 2025-09-23 (Tag 7) – unabhängig vom DEV-Param
*/
function installDevAutoSolveButton() {
  const isFinalDayReached = todayISO() >= "2025-09-23";
  if (!(DEV || isFinalDayReached)) return; // weder Dev noch Tag7 → kein Button

  // Footer-Fallbacks: .site-footer, .foot oder <footer>
  const footer = document.querySelector(".site-footer, .foot, footer");
  if (!footer) return;

  // Doppelte Buttons vermeiden
  if (footer.querySelector(".dev-autosolve")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dev-autosolve";
  btn.textContent = isFinalDayReached && !DEV ? "✔︎ Autocomplete 1–6 (Tag 7)" : "✔︎ Autocomplete 1–6";
  btn.title = "Alle Challenges (Tag 1–6) als gelöst markieren";

  btn.addEventListener("click", () => {
    try {
      const st = JSON.parse(localStorage.getItem("bdayModState") || "{}");
      ["tag1-sternbild", "tag2-survival", "tag3-escape", "tag4-horror", "tag5-sport", "tag6-puzzle"]
        .forEach(k => st[k] = true);
      localStorage.setItem("bdayModState", JSON.stringify(st));
      btn.textContent = "✓ Markiert – lade neu …";
      setTimeout(() => location.reload(), 400);
    } catch (e) {
      console.error(e);
      alert("Fehler beim Setzen des Fortschritts.");
    }
  });

  footer.appendChild(btn);
}

/* ====== Mount / Init ====== */
async function mount() {
  renderNav(); renderProgress();
  await loadDay(currentIndex);
  maybeShowFinal();
}
document.addEventListener("DOMContentLoaded", () => {
  tickCountdown(); setInterval(tickCountdown, 1000);
  initActions();
  currentIndex = Math.max(0, Math.min(unlockedIndex(), DAYS.length - 1));
  mount();

  // Footer-Button einhängen (DEV oder ab Tag 7)
  installDevAutoSolveButton();

  // Service Worker Version im Footer anzeigen (robust)
  if ("serviceWorker" in navigator) {
    function requestVersion() {
      navigator.serviceWorker.ready
        .then(reg => reg.active?.postMessage({ type: "GET_VERSION" }))
        .catch(() => { });
    }
    requestVersion();
    navigator.serviceWorker.addEventListener("controllerchange", requestVersion);
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data?.type === "VERSION") {
        const span = document.getElementById("sw-version");
        if (span) span.textContent = `SW ${e.data.version}`;
      }
    });
  }
});
