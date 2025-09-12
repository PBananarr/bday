import { ACCEPT, HINTS } from "./sternbild_data.js";

export function build(root, api){
  root.innerHTML = `
    <section class="card">
      <h2>Dein Sternenbild im Wohnzimmer</h2>
      <div class="riddle" aria-describedby="out">
        Ich trage Sterne auf der Haut, doch bin kein Himmelwesen.<br>
        Mein Kleid aus Creme auf Grün—geboren nicht aus Lesen,<br>
        sondern aus gezielter Hand in stiller Gewebekunst.<br>
        Ich bleibe, wie ich einmal war, mit sprenkelnder Brunst.<br><br>
        Mich sät man selten mit Erfolg—die Nachkomm’n ohne Glanz.<br>
        Drum such’ man mich mit großem Blick und oftmals hohem Kranz.<br>
        Ein jedes Blatt ein Unikat, ein kleines Meisterwerk:<br>
        Mal Nebel, mal Konstellation—beständig und doch keck.<br><br>
        <em>Wer bin ich?</em>
      </div>

      <form id="f" class="riddle-form" style="margin-top:.65rem">
        <input class="choice" name="answer" placeholder="Antwort eingeben …" autocomplete="off" inputmode="text"/>
        <div class="btnrow" style="margin-top:.4rem">
          <button class="btn primary" type="submit">Antwort prüfen</button>
          <button class="btn ghostbtn" type="button" id="hintBtn">Hinweis</button>
        </div>
      </form>

      <p class="hint" id="out" role="status" aria-live="polite"></p>
      <p class="hint" id="hints" style="opacity:.95"></p>
    </section>
  `;

  const riddleBox = root.querySelector(".riddle");   // <— NEU
  const out = root.querySelector("#out");
  const hintBox = root.querySelector("#hints");
  const form = root.querySelector("#f");
  const hintBtn = root.querySelector("#hintBtn");
  let hintIdx = 0;

  // Falls der Tag bereits früher gelöst wurde: Hintergrund gleich setzen
  try {
    const st = JSON.parse(localStorage.getItem("bdayModState") || "{}");
    if (st["tag1-sternbild"]) riddleBox.classList.add("solved");   // <— NEU
  } catch {}

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
      riddleBox.classList.add("solved");   // <— NEU: Bild aktivieren
      api.solved();
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

  return () => {};
}
