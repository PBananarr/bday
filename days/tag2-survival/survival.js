import { STONES_COUNT, STICKS_REQUIRED, DROP_TOLERANCE } from "./survival_data.js";

/**
 * Tag 2 – Survival
 * Event 1: Angel auswerfen → Fisch fangen
 * Event 2: Feuerstelle bauen (Steinring -> Stöcker -> Streichholz reiben)
 * Event 3: Fisch am Feuer garen
 * Bei Erfolg ruft das Modul api.solved() auf.
 */
export function build(root, api){
  root.innerHTML = `
    <section class="card">
      <h2>Survival · Vom See zum Feuer</h2>
      <div class="sv-wrap">

        <!-- Event 1: Angeln -->
        <div class="sv-stage" id="stage1">
          <h3>Event 1 · Fang dir dein Abendessen</h3>
          <div class="fish-area" id="fishArea" aria-label="Angel- und See-Bereich">
            <div class="rod" id="rod" role="button" aria-pressed="false">Angel</div>
            <div class="line" id="line"></div>
            <div class="hook" id="hook"></div>
            <div class="pond" id="pond"></div>
            <div class="fish" id="fish" aria-hidden="true"></div>
          </div>
          <p class="catch-banner" id="catchMsg">Tippe auf <strong>Angel</strong>, dann über dem See bewegen und den Fisch schnappen.</p>
          <div class="feedback" id="fb1"></div>
        </div>

        <!-- Event 2: Lager -->
        <div class="sv-stage" id="stage2" hidden>
          <h3>Event 2 · Bau ein sicheres Feuer</h3>
          <div class="camp">
            <div class="inv">
              <h4>Inventar</h4>
              <div class="inv-row" id="invRowStones"></div>
              <div class="inv-row" id="invRowSticks"></div>
              <div class="inv-row"><div class="draggable" id="match" data-type="match">🔥 Streichholz</div></div>
            </div>
            <div class="inv">
              <h4>Feuerstelle</h4>
              <div class="firezone" id="fireRing">Lege <strong>${STONES_COUNT}</strong> Steine ringförmig ab</div>
              <div class="tinderzone" id="tinderZone">Lege <strong>${STICKS_REQUIRED}</strong> Stöcker in die Mitte</div>
              <p class="match-hint">Dann: Streichholz darüberziehen</p>
              <div class="flame" id="flame"><span class="emoji">🔥</span></div>
            </div>
          </div>
          <div class="feedback" id="fb2"></div>
        </div>

        <!-- Event 3: Grill -->
        <div class="sv-stage" id="stage3" hidden>
          <h3>Event 3 · Den Fang garen</h3>
          <div class="grill" id="grill">
            <div class="firepit" id="firepit">
              <div class="fish-raw" id="rawFish" draggable="false">🐟 roh</div>
              <div class="fish-cooked" id="cookedFish">🐟 gegart</div>
            </div>
          </div>
          <p class="finish-note">Ziehe den Fisch auf die heiße Zone.</p>
          <div class="feedback" id="fb3"></div>
        </div>

      </div>
    </section>
  `;

  /* ===== Helper ===== */
  const $ = (s, p=root) => p.querySelector(s);
  const rect = el => el.getBoundingClientRect();
  const inRect = (pt, r, tol=0) => (pt.x >= r.left - tol && pt.x <= r.right + tol && pt.y >= r.top - tol && pt.y <= r.bottom + tol);
  const overlap = (a, b, tol=0) => {
    const ra = rect(a), rb = rect(b);
    return !(ra.right < rb.left - tol || ra.left > rb.right + tol || ra.bottom < rb.top - tol || ra.top > rb.bottom + tol);
  };
  const centerOf = el => { const r=rect(el); return { x:r.left + r.width/2, y:r.top + r.height/2 }; };

  /* =========================================
   * Event 1 – Angeln
   * =======================================*/
  const stage1 = $("#stage1");
  const rod = $("#rod");
  const line = $("#line");
  const hook = $("#hook");
  const pond = $("#pond");
  const fish = $("#fish");
  const fb1 = $("#fb1");
  const catchMsg = $("#catchMsg");

  let casting = false;
  let fishCaught = false;

  function placeFishRandom(){
    const pr = rect(pond);
    const x = pr.left + 30 + Math.random()*(pr.width-60);
    const y = pr.top + 30 + Math.random()*(pr.height-60);
    fish.style.left = x + "px";
    fish.style.top  = y + "px";
    fish.style.transform = "translate(-50%,-50%)";
  }

  rod.addEventListener("click", ()=>{
    casting = !casting;
    rod.classList.toggle("active", casting);
    rod.setAttribute("aria-pressed", casting ? "true" : "false");
    if(casting){
      // Leine „ausfahren“
      line.style.height = "160px";
      fish.classList.add("show");
      placeFishRandom();
      catchMsg.textContent = "Bewege dich über den See und tippe den Fisch an!";
    } else {
      line.style.height = "0px";
      fish.classList.remove("show");
      catchMsg.textContent = "Tippe wieder auf Angel, um neu zu werfen.";
    }
  });

  // Fisch fangen: nur möglich wenn casting aktiv und der Nutzer den Fisch an tippt
  ["pointerdown","click","touchstart"].forEach(evt=>{
    fish.addEventListener(evt, (e)=>{
      if(!casting || fishCaught) return;
      fishCaught = true;
      fish.classList.remove("show");
      fb1.className = "feedback ok";
      fb1.textContent = "Gefangen! Ab zum Lager.";
      // Stage 2 aktivieren
      $("#stage2").hidden = false;
      // Stage 1 visuell abschließen
      stage1.querySelector(".fish-area").style.filter="grayscale(0.3)";
      stage1.querySelector(".fish-area").style.opacity="0.9";
    }, {passive:true});
  });

  /* =========================================
   * Event 2 – Feuerstelle bauen
   * =======================================*/
  const stage2 = $("#stage2");
  const invRowStones = $("#invRowStones");
  const invRowSticks = $("#invRowSticks");
  const fireRing = $("#fireRing");
  const tinderZone = $("#tinderZone");
  const match = $("#match");
  const flame = $("#flame");
  const fb2 = $("#fb2");

  // Inventar erzeugen
  for(let i=0;i<STONES_COUNT;i++){
    const el = document.createElement("div");
    el.className="draggable";
    el.textContent="🪨";
    el.dataset.type="stone";
    invRowStones.appendChild(el);
  }
  for(let i=0;i<STICKS_REQUIRED+1;i++){
    const el = document.createElement("div");
    el.className="draggable";
    el.textContent="🪵";
    el.dataset.type="stick";
    invRowSticks.appendChild(el);
  }

  // Drag-Logik (Pointer Events)
  let drag = { el:null, ox:0, oy:0, startX:0, startY:0, from:null };

  function onPointerDown(e){
    const target = e.target.closest(".draggable");
    if(!target) return;
    drag.el = target;
    drag.from = target.parentElement;
    const r = rect(target);
    drag.ox = e.clientX - r.left;
    drag.oy = e.clientY - r.top;
    drag.startX = r.left; drag.startY = r.top;
    target.style.position="fixed";
    target.style.left = r.left+"px";
    target.style.top = r.top+"px";
    target.style.zIndex = "9999";
    target.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e){
    if(!drag.el) return;
    drag.el.style.left = (e.clientX - drag.ox) + "px";
    drag.el.style.top  = (e.clientY - drag.oy) + "px";
  }
  function onPointerUp(e){
    if(!drag.el) return;
    const el = drag.el;
    el.releasePointerCapture?.(e.pointerId);

    // Drop-Ziele prüfen
    const isStone = el.dataset.type === "stone";
    const isStick = el.dataset.type === "stick";
    let placed = false;

    if(isStone && overlap(el, fireRing, DROP_TOLERANCE)){
      // auf Ring platzieren: an Kreisrand snappen
      snapToRing(el, fireRing);
      placed = true;
      fireRing.classList.toggle("complete", countInside("stone", fireRing) >= STONES_COUNT);
    } else if(isStick && overlap(el, tinderZone, DROP_TOLERANCE)){
      // in die Mitte
      snapInside(el, tinderZone);
      placed = true;
      tinderZone.classList.toggle("complete", countInside("stick", tinderZone) >= STICKS_REQUIRED);
    } else if(el.id === "match"){
      // Streichholz über die Stöcker ziehen -> Feuer
      if(tinderZone.classList.contains("complete") && fireRing.classList.contains("complete") && overlap(el, tinderZone, DROP_TOLERANCE)){
        ignite();
        placed = true; // wir lassen es auf der Zone
      }
    }

    if(!placed){
      // zurück in Ursprung
      el.style.position=""; el.style.left=""; el.style.top=""; el.style.zIndex="";
      drag.from.appendChild(el);
    }

    drag.el = null; drag.from = null;
    checkStage2Done();
  }

  stage2.addEventListener("pointerdown", onPointerDown);
  stage2.addEventListener("pointermove", onPointerMove);
  stage2.addEventListener("pointerup", onPointerUp);
  stage2.addEventListener("pointercancel", onPointerUp);

  function polarCoords(center, angleDeg, radius){
    const rad = angleDeg * Math.PI / 180;
    return { x: center.x + Math.cos(rad)*radius, y: center.y + Math.sin(rad)*radius };
  }
  function snapToRing(el, ring){
    const c = centerOf(ring);
    const rr = rect(ring);
    const radius = Math.min(rr.width, rr.height)/2 - 16; // etwas Puffer
    // verteilungswinkel anhand aktueller Anzahl
    const idx = countInside("stone", ring);
    const angle = (idx / STONES_COUNT) * 360;
    const p = polarCoords(c, angle, radius);
    el.style.position="fixed";
    el.style.left = (p.x - rect(el).width/2) + "px";
    el.style.top  = (p.y - rect(el).height/2) + "px";
    el.style.zIndex="1";
    ring.appendChild(el);
  }
  function snapInside(el, zone){
    const r = rect(zone);
    const x = r.left + 16 + Math.random()*(r.width - 32);
    const y = r.top  + 16 + Math.random()*(r.height - 32);
    el.style.position="fixed";
    el.style.left = (x - rect(el).width/2) + "px";
    el.style.top  = (y - rect(el).height/2) + "px";
    el.style.zIndex="1";
    zone.appendChild(el);
  }
  function countInside(type, container){
    return Array.from(container.querySelectorAll(`.draggable[data-type="${type}"]`)).length;
  }
  function ignite(){
    flame.classList.add("show");
    fb2.className="feedback ok";
    fb2.textContent="Feuer entfacht! Weiter zum Grill.";
    // Stage 3 freischalten
    $("#stage3").hidden = false;
  }

  function checkStage2Done(){
    const ringOk = fireRing.classList.contains("complete");
    const tinderOk = tinderZone.classList.contains("complete");
    if(ringOk && tinderOk){
      // Hinweis zum Streichholz
      fb2.className="feedback ok";
      fb2.textContent="Jetzt das Streichholz über die Stöcker ziehen, um das Feuer zu entzünden.";
    } else {
      // Teilfeedback
      const missingStones = STONES_COUNT - countInside("stone", fireRing);
      const missingSticks = STICKS_REQUIRED - countInside("stick", tinderZone);
      fb2.className="feedback err";
      fb2.textContent = `Fehlt noch: ${missingStones>0? missingStones+" Stein(e) " : ""}${missingSticks>0? " · "+missingSticks+" Stock/⌀" : ""}`.replace(" · ","");
    }
  }

  /* =========================================
   * Event 3 – Fisch garen
   * =======================================*/
  const stage3 = $("#stage3");
  const firepit = $("#firepit");
  const rawFish = $("#rawFish");
  const cookedFish = $("#cookedFish");
  const fb3 = $("#fb3");

  let fishGiven = false;
  // Roh-Fisch auftauchen lassen, wenn Stage 2 aktiv war
  const observer = new MutationObserver(()=>{
    if(!stage3.hidden && fishCaught && !fishGiven){
      fishGiven = true;
      rawFish.style.display="block";
    }
  });
  observer.observe(stage3, { attributes:true, attributeFilter:["hidden"] });

  // simples Drag für rohen Fisch
  let fdrag = { el:null, ox:0, oy:0 };
  rawFish.addEventListener("pointerdown", e=>{
    fdrag.el = rawFish;
    const r = rect(rawFish);
    fdrag.ox = e.clientX - r.left;
    fdrag.oy = e.clientY - r.top;
    rawFish.setPointerCapture?.(e.pointerId);
    rawFish.classList.add("dragging");
    rawFish.style.position="fixed";
    rawFish.style.left = r.left+"px";
    rawFish.style.top  = r.top+"px";
    rawFish.style.zIndex="9999";
  });
  stage3.addEventListener("pointermove", e=>{
    if(!fdrag.el) return;
    rawFish.style.left = (e.clientX - fdrag.ox) + "px";
    rawFish.style.top  = (e.clientY - fdrag.oy) + "px";
  });
  stage3.addEventListener("pointerup", e=>{
    if(!fdrag.el) return;
    rawFish.releasePointerCapture?.(e.pointerId);
    if(overlap(rawFish, firepit, 16)){
      // Gar!
      rawFish.style.display="none";
      cookedFish.classList.add("done");
      fb3.className="feedback ok";
      fb3.textContent="Mahlzeit! Aufgabe erfüllt.";
      api.solved();
    } else {
      // zurückspringen
      rawFish.style.position=""; rawFish.style.left=""; rawFish.style.top=""; rawFish.style.zIndex="";
      rawFish.classList.remove("dragging");
    }
    fdrag.el = null;
  });

  /* Cleanup */
  return () => {
    observer.disconnect();
  };
}
