import { ACCEPT, HINTS } from "./sternbild_data.js";

export function build(root, api){
  root.innerHTML = `
    <section class="card">
      <h2>Dein Sternenbild im Wohnzimmer</h2>

      <div class="riddle" aria-describedby="out">
        Ich trage Sterne auf der Haut, doch bin kein Himmelwesen.
        Mein Kleid aus Creme auf Grün—geboren nicht aus Lesen,<br>
        sondern aus gezielter Hand in stiller Gewebekunst.
        Ich bleibe, wie ich einmal war, mit sprenkelnder Brunst.<br><br>
        Mich sät man selten mit Erfolg—die Nachkomm’n ohne Glanz.
        Drum such’ man mich mit großem Blick und oftmals hohem Kranz.<br>
        Ein jedes Blatt ein Unikat, ein kleines Meisterwerk:
        Mal Nebel und mal Konstellation—beständig und viel wert.
        <em>Wer bin ich?</em>
      </div>

      <form id="f" class="riddle-form" style="margin-top:.65rem">
        <input class="choice" name="answer" placeholder="Antwort eingeben …" autocomplete="off" inputmode="text"/>
        <div class="btnrow" style="margin-top:.4rem">
          <button class="btn primary" type="submit">Antwort prüfen</button>
          <button class="btn ghostbtn" type="button" id="hintBtn">Hinweis</button>
          <button class="btn" type="button" id="show-badge" disabled>🏅 Dein Badge</button>
        </div>
      </form>

      <p class="hint" id="out" role="status" aria-live="polite"></p>
      <p class="hint" id="hints" style="opacity:.95"></p>
    </section>
  `;

  const riddleBox = root.querySelector(".riddle");
  const out = root.querySelector("#out");
  const hintBox = root.querySelector("#hints");
  const form = root.querySelector("#f");
  const hintBtn = root.querySelector("#hintBtn");
  const badgeBtn = root.querySelector("#show-badge");
  let hintIdx = 0;

  // === Badge-Modal anlegen ===
  const badge = createBadgeModal();
  root.appendChild(badge.dialog);

  // Fortschritt prüfen (bereits gelöst?)
  let solvedAlready = false;
  try {
    const st = JSON.parse(localStorage.getItem("bdayModState") || "{}");
    solvedAlready = !!st["tag1-sternbild"];
  } catch {}

  if (solvedAlready) {
    riddleBox.classList.add("solved");
    badgeBtn.disabled = false;
  }

  const normalize = s => (s||"").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/["'’]+/g,"").replace(/\s+/g," ").trim();

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const val = normalize(new FormData(e.currentTarget).get("answer"));
    const ok = ACCEPT.some(a => normalize(a) === val);
    if(ok){
      out.textContent = "Richtig! Monstera „Thai Constellation“. ✨🪴";
      out.classList.add("success");
      riddleBox.classList.add("solved");
      badgeBtn.disabled = false;             // Badge ab jetzt freigeschaltet
      api.solved();
      // Optional: Badge direkt öffnen
      // badge.open();
    } else {
      out.textContent = "Noch nicht. Nutze den Hinweis oder probier’s erneut.";
    }
  });

  hintBtn.addEventListener("click", ()=>{
    if(hintIdx < HINTS.length){
      hintBox.innerHTML += (hintBox.innerHTML ? "<br>" : "") + "• " + HINTS[hintIdx++];
    } else {
      out.textContent = "Keine weiteren Hinweise 😉";
    }
  });

  badgeBtn.addEventListener("click", () => badge.open());

  return () => {};

  // ===== Badge-Modal =====
  function createBadgeModal(){
    const dlg = document.createElement("dialog");
    dlg.id = "stern-badge-modal";
    dlg.innerHTML = `
      <article class="badge-card">
        <div class="badge-frame">
          <img id="stern-badge-img" alt="Sternbild-Badge" />
        </div>
        <div class="badge-caption">
          <div class="t1">Monstera</div>
          <div class="t2">🪴 Thai Constellation 🪴</div>
        </div>
        <div class="badge-actions">
          <button class="btn" id="stern-badge-close">Schließen</button>
        </div>
      </article>
    `;

    // Schließen bei Klick neben dem Card
    dlg.addEventListener("click", (e) => {
      const rect = dlg.querySelector(".badge-card")?.getBoundingClientRect();
      if (!rect) return;
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        dlg.close();
      }
    });
    dlg.querySelector("#stern-badge-close")?.addEventListener("click", () => dlg.close());

    const open = () => {
      const img = dlg.querySelector("#stern-badge-img");
      if (img) {
        // Nutzt vorhandenes Asset – leicht zu ändern:
        img.src = "../../img/thaiMonsteraThemeStars.png";
        img.onerror = () => { img.alt = "Badge-Bild fehlt (../../img/thaiMonsteraThemeStars.png)"; };
      }
      if (!dlg.open) dlg.showModal();
    };

    return { dialog: dlg, open };
  }
}
