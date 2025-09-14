/* ========================== escape.js =========================== */

import { escape_STORY } from "./escape_data.js";

/* ========================== DAY-ADAPTER =========================== */
export async function build(host, api) {
  host.innerHTML = `
    <section class="card">
      <h1>Sunny Meadow – Letzte Visite</h1>
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

  // ===== Root-Container aufbauen =====
  root.innerHTML = ""; // wichtig: zuerst leeren!

  const screen = document.createElement("section");
  screen.className = "escape-screen";
  root.appendChild(screen);

  // FX-Overlay (Blood/Scare/Doors)
  const fx = document.createElement("div");
  fx.className = "escape-fx";
  root.appendChild(fx);

  // Badge-Modal NACH dem Leeren und nach den Grund-Layern anhängen
  const badge = createBadgeModal();
  root.appendChild(badge.dialog);

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
        goStart();
      });
      list.appendChild(btn);
    } else {
      // Normale Räume & Finale mit Choices
      (scene.choices || []).forEach((c) => {
        const btn = mkChoice(c.label, () => {
          // Effekte VOR dem Wechsel
          if (c.effect === "blood") bloodSplash();
          if (c.effect === "scare") scarePulse();
          if (c.effect === "door") doorFlash();

          if (c.restart) { goStart(); return; }
          goto(c.to);
        });
        list.appendChild(btn);
      });

      // Im FINAL-Screen zusätzlich "Dein Badge" einfügen
      if (scene.type === "final") {
        const badgeBtn = mkChoice("🏅 Dein Badge", () => {
          badge.open();
        });
        list.appendChild(badgeBtn);
      }

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

  function scarePulse() {
    const wrap = document.createElement("div");
    wrap.className = "fx-scare on";
    wrap.innerHTML = `<div class="fx-scare-backdrop"></div>`;
    fx.appendChild(wrap);
    setTimeout(() => wrap.remove(), 260);
  }

  function doorFlash() {
    const d = document.createElement("div");
    d.className = "fx-door";
    fx.appendChild(d);
    requestAnimationFrame(() => {
      d.classList.add("show");
      // kleiner Screen-Zoom
      screen.classList.add("dooring");
      setTimeout(() => screen.classList.remove("dooring"), 450);
    });
    setTimeout(() => d.remove(), 460);
  }

  // ===== Badge-Modal (Erfolg) =====
 function createBadgeModal() {
  const dlg = document.createElement("dialog");
  dlg.id = "escape-badge-modal";
  dlg.innerHTML = `
    <article class="badge-card">
      <div class="badge-frame">
        <img id="escape-badge-img" alt="Escape Badge" />
      </div>
      <div class="badge-text">
        <span class="t1">Glückwunsch</span>
        <span class="t2">du bist entkommen</span>
      </div>
      <div class="badge-actions">
        <button class="btn" id="escape-badge-close">Schließen</button>
      </div>
    </article>
  `;

  // Close bei Klick außerhalb
  dlg.addEventListener("click", (e) => {
    const card = dlg.querySelector(".badge-card");
    const r = card?.getBoundingClientRect();
    if (!r) return;
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      dlg.close();
    }
  });
  dlg.querySelector("#escape-badge-close")?.addEventListener("click", () => dlg.close());

  const open = () => {
    if (!dlg.isConnected) document.body.appendChild(dlg);
    const img = dlg.querySelector("#escape-badge-img");
    if (img) {
      img.src = "../../img/escape-bg.png";
      img.onerror = () => { img.alt = "Badge Bild fehlt (../../img/escape-bg.png)"; };
    }
    if (!dlg.open) dlg.showModal();
  };

  return { dialog: dlg, open };
}


  // Public API (falls du extern steuern willst)
  return {
    restart: goStart,
    goto,
  };
}
