/* ========================== escape.js =========================== */


import { escape_STORY } from "./escape_data.js";

/* ========================== DAY-ADAPTER =========================== */
export async function build(host, api) {
  host.innerHTML = `
    <section class="card">
      <h2>Sunny Meadows Mental Institution</h2>
      <div id="escape-root"></div>
    </section>
  `;
  const mount = host.querySelector("#escape-root");

  // Finalzustand an den Main-Loader melden
  initescape(mount, { onFinal: () => api.solved() });

  return () => { mount.innerHTML = ""; }; // optionales Cleanup
}

/* =========================== ENGINE ============================== */
function initescape(host = "#escape-root", options = {}) {
  const root = typeof host === "string" ? document.querySelector(host) : host;
  if (!root) throw new Error("escape: Host-Element nicht gefunden.");

  const opts = {
    scareImageDefault: options.scareImageDefault || "../../img/daemonJumpscare.png",
    showMeter: options.showMeter !== false,
    onFinal: typeof options.onFinal === "function" ? options.onFinal : null,
  };
  let finalNotified = false;

  root.classList.add("escape-root");

  // ===== State =====
  const startId = escape_STORY?.start || Object.keys(escape_STORY?.scenes || {})[0];
  const maxSteps = escape_STORY?.meta?.maxStepsToWin ?? 8;

  const state = {
    currentId: startId,
    steps: 0, // zählt nur "room" -> Finale nach maxSteps
  };

  // ===== Root-Container =====
  const screen = document.createElement("section");
  screen.className = "escape-screen";
  root.innerHTML = "";
  root.appendChild(screen);

  // FX-Overlay (Blut/Jumpscare)
  const fx = document.createElement("div");
  fx.className = "escape-fx";
  root.appendChild(fx);

  render(state.currentId, true);

  // ===== Rendering =====
  function render(id, initial = false) {
    const scene = escape_STORY?.scenes?.[id];
    if (!scene) return;

    // Finale erreicht? Genau 1× melden
    if (scene.type === "final" && !finalNotified) {
      finalNotified = true;
      opts.onFinal?.();
    }

    if (!initial) {
      screen.classList.add("entering");
      setTimeout(() => screen.classList.remove("entering"), 420);
    }

    screen.innerHTML = "";
    const card = document.createElement("article");
    card.className = "escape-card";

    const h = document.createElement("h2");
    h.textContent = scene.title || escape_STORY?.meta?.title || "escape";
    card.appendChild(h);

    const p = document.createElement("p");
    p.textContent = scene.text || "";
    card.appendChild(p);

    const list = document.createElement("div");
    list.className = "choice-list";
    card.appendChild(list);

    if (scene.type === "death") {
      // Todesseite -> Nur Restart
      const btn = mkChoice("↻ Noch einmal versuchen", () => {
        hideScare();
        goStart();
      });
      list.appendChild(btn);
    } else {
      // Normale Räume & Finale mit Choices
      (scene.choices || []).forEach((c) => {
        const btn = mkChoice(c.label, () => {
          // Effekte VOR dem Wechsel
          if (c.effect === "blood") bloodSplash();
          if (c.effect === "scare") {
            // Versuch: Bild aus Zielszene, sonst aus aktueller, sonst Default
            const imgFromTarget = escape_STORY?.scenes?.[c.to]?.scareImage;
            showScare(imgFromTarget || scene?.scareImage || opts.scareImageDefault);
          }

          if (c.restart) { goStart(); return; }
          goto(c.to);
        });
        list.appendChild(btn);
      });

      // Schrittanzeige nur in Räumen
      if (opts.showMeter && scene.type === "room") {
        const meter = document.createElement("div");
        meter.className = "escape-meter";
        meter.innerHTML = `<span>Entscheidung <strong>${state.steps + 1}</strong> / ${maxSteps}</span>`;
        card.appendChild(meter);
      }
    }

    screen.appendChild(card);
  }

  function mkChoice(label, onClick) {
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = label;
    b.addEventListener("click", onClick, { once: true });
    return b;
  }

  // ===== Navigation =====
  function goto(toId) {
    const next = escape_STORY?.scenes?.[toId];
    if (!next) return;

    // Schritt nur erhöhen, wenn wir gerade in einem "room" sind
    const cur = escape_STORY?.scenes?.[state.currentId];
    if (cur?.type === "room") state.steps++;

    // Tür/Seiten-Transition
    screen.classList.add("leaving");
    setTimeout(() => {
      state.currentId = toId;
      render(state.currentId);
      screen.classList.remove("leaving");
    }, 240);
  }

  function goStart() {
    state.currentId = startId;
    state.steps = 0;
    render(state.currentId);
  }

  // ===== FX =====
  function bloodSplash() {
    const drop = document.createElement("div");
    drop.className = "fx-blood";
    fx.appendChild(drop);
    requestAnimationFrame(() => drop.classList.add("show"));
    setTimeout(() => drop.remove(), 600);
  }

  function showScare(imgUrl) {
    const wrap = document.createElement("div");
    wrap.className = "fx-scare";
    wrap.innerHTML = `
      <div class="fx-scare-backdrop"></div>
      ${imgUrl ? `<img src="${imgUrl}" alt="" class="fx-scare-img" />` : ""}
    `;
    fx.appendChild(wrap);
    // kleiner Delay, damit CSS-Transition greift
    setTimeout(() => wrap.classList.add("on"), 10);
    // auto-hide
    setTimeout(() => hideScare(), 900);
  }

  function hideScare() {
    const el = fx.querySelector(".fx-scare");
    if (!el) return;
    el.classList.remove("on");
    setTimeout(() => el.remove(), 220);
  }

  // Public API (falls du extern steuern willst)
  return {
    restart: goStart,
    goto,
  };
}
