/* ====== Kalender-Setup ====== */
const TZ = "Europe/Berlin";
const DAY_START_ISO = "2025-09-16T00:00:00+02:00";
const BIRTHDAY_ISO = "2025-09-23T00:00:00+02:00"; // Ziel für Countdown
// Tage 1..8 (16.–23.09.)
const DAYS = [
  { key:"day1", date:"2025-09-16", title:"Tag 1 · Pflanzen-Rätsel", badge:"🪴 Pflanzen-Profi" },
  { key:"day2", date:"2025-09-17", title:"Tag 2 · Bushcraft-Kompass", badge:"🧭 Pfadfinder/in" },
  { key:"day3", date:"2025-09-18", title:"Tag 3 · Geisterjagd", badge:"👻 Mutig" },
  { key:"day4", date:"2025-09-19", title:"Tag 4 · Weinwahl", badge:"🥂 Weinliebhaberin" },
  { key:"day5", date:"2025-09-20", title:"Tag 5 · Sport-Boost", badge:"💪 Durchzieher/in" },
  { key:"day6", date:"2025-09-21", title:"Tag 6 · Motorrad-Safety", badge:"🏍️ Safety First" },
  { key:"day7", date:"2025-09-22", title:"Tag 7 · Exit-Teaser", badge:"🧩 Rätselfuchs" },
  { key:"day8", date:"2025-09-23", title:"Tag 8 · Finale", badge:"🎖️ Missionsabschluss" },
];
const TOTAL = DAYS.length;
const DEV = new URLSearchParams(location.search).get("dev") === "1";

/* ====== State ====== */
const qs = s => document.querySelector(s);
const state = JSON.parse(localStorage.getItem("bdayDailyState") || "{}");
function save(){ localStorage.setItem("bdayDailyState", JSON.stringify(state)); }
function setDone(key){ state[key]=true; save(); renderNav(); renderProgress(); maybeShowFinal(); }

/* ====== Zeit / Freischaltung ====== */
function todayISODate(){
  // Ohne Serverzeit: lokale Zeit als ISO-YYYY-MM-DD
  const d = new Date();
  const y = d.getFullYear(), m = (d.getMonth()+1+"").padStart(2,"0"), day = (d.getDate()+"").padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function unlockedIndex(){
  if(DEV) return DAYS.length-1;
  const today = todayISODate();
  let idx = -1;
  for(let i=0;i<DAYS.length;i++){
    if(DAYS[i].date <= today) idx = i;
  }
  return Math.max(idx, -1);
}

/* ====== Countdown ====== */
function tickCountdown(){
  const out = qs("#countdown");
  const target = new Date(BIRTHDAY_ISO).getTime();
  const now = Date.now();
  let delta = Math.max(0, target - now);
  const d = Math.floor(delta / (1000*60*60*24)); delta -= d*24*60*60*1000;
  const h = Math.floor(delta / (1000*60*60)); delta -= h*60*60*1000;
  const m = Math.floor(delta / (1000*60)); delta -= m*60*1000;
  const s = Math.floor(delta / 1000);
  out.textContent = `${d}T ${h}h ${m}m ${s}s`;
}

/* ====== Navigation / Label ====== */
let currentIndex = Math.min(unlockedIndex(), 0); // default auf 0 sobald freigeschaltet
function renderNav(){
  const nav = qs("#dayNav");
  nav.innerHTML = "";
  const uIdx = unlockedIndex();
  DAYS.forEach((d, i)=>{
    const dot = document.createElement("button");
    dot.className = "daydot" + (i<=uIdx ? " unlocked" : "") + (state[d.key] ? " done" : "") + (i===currentIndex ? " active" : "");
    dot.setAttribute("aria-label", `${d.title} (${d.date})`);
    dot.disabled = i>uIdx;
    dot.addEventListener("click", ()=>{ currentIndex=i; mountDay(); renderNav(); });
    nav.appendChild(dot);
  });
  qs("#devBadge").hidden = !DEV;
  qs("#dayLabel").textContent = `${DAYS[currentIndex]?.title ?? "Noch gesperrt"} · ${DAYS[currentIndex]?.date ?? ""}`;
  qs("#prevDay").disabled = currentIndex<=0;
  qs("#nextDay").disabled = currentIndex>=Math.min(uIdx, DAYS.length-1);
}
function renderProgress(){
  const done = DAYS.filter(d=>state[d.key]).length;
  qs("#totalCount").textContent = TOTAL;
  qs("#doneCount").textContent = done;
  qs("#progress").style.width = `${(done/TOTAL)*100}%`;
}

/* ====== Final & Badges ====== */
function badgesRender(){
  const wrap = qs("#badges");
  wrap.innerHTML = "";
  DAYS.forEach(d=>{
    const el = document.createElement("span");
    el.className = "badge";
    const earned = state[d.key];
    el.textContent = (earned? "✔ " : "• ") + d.badge;
    wrap.appendChild(el);
  });
}
function confetti(count=120){
  const cont = qs("#confetti");
  const colors = ["#34d399","#60a5fa","#f472b6","#fbbf24","#a78bfa","#f87171"];
  for(let i=0;i<count;i++){
    const p = document.createElement("div");
    p.className="confetti";
    p.style.left = Math.random()*100+"vw";
    p.style.top = "-10vh";
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    const dur = 2.5 + Math.random()*2.5;
    const delay = Math.random()*0.8;
    p.style.animationDuration = dur+"s";
    p.style.animationDelay = delay+"s";
    cont.appendChild(p);
    setTimeout(()=>p.remove(), (dur+delay)*1000+500);
  }
}
function maybeShowFinal(){
  const allDone = DAYS.every(d=>state[d.key]);
  const reached = todayISODate() >= "2025-09-23";
  const final = qs("#final");
  if((allDone || reached) && final.hidden){
    final.hidden = false;
    badgesRender();
    confetti();
  }
}

/* ====== Tages-Mounting ====== */
function mountDay(){
  const host = qs("#dayHost");
  host.innerHTML = "";
  const uIdx = unlockedIndex();
  if(currentIndex>uIdx){
    const card = document.createElement("section");
    card.className = "card lock";
    card.innerHTML = `<h2>🔒 ${DAYS[currentIndex].title}</h2>
      <p>Dieses Rätsel wird am <strong>${DAYS[currentIndex].date}</strong> freigeschaltet.</p>`;
    host.appendChild(card);
    return;
  }
  // Karte rendern
  const card = document.createElement("section");
  card.className = "card";
  const solved = !!state[DAYS[currentIndex].key];
  card.innerHTML = `
    <h2>${DAYS[currentIndex].title}</h2>
    <div id="puzzleMount"></div>
    <p class="hint" id="dayHint"></p>
    <div class="btnrow" style="margin-top:.25rem">
      <button class="btn" id="markSolved" ${solved?"disabled":""}>Als gelöst markieren</button>
      <button class="btn ghostbtn" id="retryBtn">Neu laden</button>
    </div>
  `;
  host.appendChild(card);

  // Puzzle je Tag einbauen
  const mount = card.querySelector("#puzzleMount");
  const api = { solved: ()=>{ setDone(DAYS[currentIndex].key); renderNav(); mountDay(); } };
  switch(currentIndex){
    case 0: buildPuzzle_1(mount, api); break;
    case 1: buildPuzzle_2(mount, api); break;
    case 2: buildPuzzle_3(mount, api); break;
    case 3: buildPuzzle_4(mount, api); break;
    case 4: buildPuzzle_5(mount, api); break;
    case 5: buildPuzzle_6(mount, api); break;
    case 6: buildPuzzle_7(mount, api); break;
    case 7: buildPuzzle_8(mount, api); break;
  }

  // Buttons
  card.querySelector("#markSolved").addEventListener("click", ()=>{
    setDone(DAYS[currentIndex].key);
    mountDay();
  });
  card.querySelector("#retryBtn").addEventListener("click", ()=>location.reload());
}

/* ====== Beispiel-Puzzles (leicht austauschbar) ====== */
/* Tag 1 – Pflanzen (Multiple-Choice, Monstera) */
function buildPuzzle_1(root, api){
  root.innerHTML = `
    <p>Welche Pflanze hat „Fenster“ in den Blättern?</p>
    <form id="f1">
      <label class="choice"><input type="radio" name="p" value="monstera"> Monstera</label>
      <label class="choice"><input type="radio" name="p" value="ficus"> Ficus</label>
      <label class="choice"><input type="radio" name="p" value="dracaena"> Dracaena</label>
      <button class="btn" type="submit">Antwort prüfen</button>
    </form>`;
  const hint = qs("#dayHint");
  root.querySelector("#f1").addEventListener("submit", e=>{
    e.preventDefault();
    const val = new FormData(e.currentTarget).get("p");
    if(val==="monstera"){ hint.textContent = "Richtig! ✨"; api.solved(); }
    else { hint.textContent = "Nope – such die mit den „Fenstern“!"; }
  });
}

/* Tag 2 – Kompass (an 0° ausrichten) */
function buildPuzzle_2(root, api){
  root.innerHTML = `
    <p>Richte den Kompass auf <strong>Norden</strong>.</p>
    <div class="compass"><div class="dial" id="dial"><span>N</span></div></div>
    <input id="angle" type="range" min="0" max="360" value="180" aria-label="Kompass Winkel">
    <p class="hint">Winkel: <span id="angleVal">180</span>°</p>`;
  const range = qs("#angle"), label = qs("#angleVal"), dial = qs("#dial");
  function update(){
    const v = Number(range.value);
    label.textContent = v;
    dial.style.transform = `rotate(${v}deg)`;
    if(v<=10 || v>=350){ api.solved(); }
  }
  range.addEventListener("input", update); update();
}

/* Tag 3 – Geisterjagd (Spotlight) */
function buildPuzzle_3(root, api){
  root.innerHTML = `
    <p>Bewege die Taschenlampe über das Feld und tippe den Geist!</p>
    <div class="ghostfield" id="ghostField" aria-label="Geisterfeld">
      <button class="ghost" id="ghost" aria-label="Geist">👻</button>
      <div class="spotlight" id="spotlight"></div>
    </div>`;
  const field = qs("#ghostField"), ghost = qs("#ghost"), spot = qs("#spotlight");
  function place(){
    const pad=24, r=field.getBoundingClientRect();
    const x=pad+Math.random()*(r.width-pad*2), y=pad+Math.random()*(r.height-pad*2);
    ghost.style.left=x+"px"; ghost.style.top=y+"px"; ghost.style.transform="translate(-50%,-50%)";
  }
  place();
  ["pointermove","touchmove"].forEach(evt=>{
    field.addEventListener(evt, e=>{
      const r=field.getBoundingClientRect();
      const cx=(e.clientX ?? (e.touches&&e.touches[0].clientX))-r.left;
      const cy=(e.clientY ?? (e.touches&&e.touches[0].clientY))-r.top;
      spot.style.setProperty("--x",`${cx}px`); spot.style.setProperty("--y",`${cy}px`);
    },{passive:true});
  });
  ghost.addEventListener("click", ()=>api.solved());
}

/* Tag 4 – Weinwahl (Weißwein) */
function buildPuzzle_4(root, api){
  root.innerHTML = `
    <p>Welcher Wein ist ihr Favorit?</p>
    <div class="btnrow">
      <button class="btn ghostbtn" data-w="rot">Rotwein</button>
      <button class="btn primary" data-w="weiß">Weißwein</button>
      <button class="btn ghostbtn" data-w="rose">Rosé</button>
    </div>`;
  const hint = qs("#dayHint");
  root.querySelectorAll("[data-w]").forEach(b=>b.addEventListener("click", ()=>{
    if(b.dataset.w==="weiß"){ hint.textContent="Weiß wie ihr Lieblingswein! 🥂"; api.solved(); }
    else { hint.textContent="Nicht ganz – sie mag Weißwein."; }
  }));
}

/* Tag 5 – Sport-Boost (15 Taps / 8s) */
function buildPuzzle_5(root, api){
  root.innerHTML = `
    <p>Schaffst du <strong>15 Reps</strong> in <strong>8 Sekunden</strong>? Tippe schnell!</p>
    <div class="btnrow"><button class="btn big" id="repBtn">Tap!</button></div>
    <p>Reps: <strong id="repCount">0</strong>/15 · Zeit: <strong id="repTime">8.0</strong>s</p>`;
  const btn=qs("#repBtn"), c=qs("#repCount"), t=qs("#repTime"); let reps=0, left=8.0, int=null;
  function start(){ if(int) return; int=setInterval(()=>{ left=Math.max(0,left-.1); t.textContent=left.toFixed(1);
    if(left<=0){ clearInterval(int); int=null; if(reps>=15) api.solved(); reps=0; left=8.0; c.textContent="0"; t.textContent="8.0"; }
  },100);}
  btn.addEventListener("click", ()=>{ start(); reps++; c.textContent=reps; });
}

/* Tag 6 – Motorrad-Safety (Helm vor Motor) */
function buildPuzzle_6(root, api){
  root.innerHTML = `
    <label class="choice" style="display:flex;align-items:center;gap:.6rem;">
      <input type="checkbox" id="helmet"> Helm an
    </label>
    <button class="btn" id="startEngine">Motor starten</button>`;
  const hint = qs("#dayHint");
  qs("#startEngine").addEventListener("click", ()=>{
    if(qs("#helmet").checked){ hint.textContent="Vrrooom! Sicher unterwegs. ✅"; api.solved(); }
    else { hint.textContent="Erst den Helm aufsetzen! 🪖"; }
  });
}

/* Tag 7 – Exit-Teaser (Mini-Codewort) */
function buildPuzzle_7(root, api){
  root.innerHTML = `
    <p>Exit-Vibe: Entschlüssele das Codewort! Tipp: <em>Soldat · Mama · Natur</em></p>
    <form id="f7">
      <input class="choice" style="padding:.6rem;" name="code" placeholder="Codewort eingeben" autocomplete="off"/>
      <button class="btn" type="submit">Prüfen</button>
    </form>`;
  const hint = qs("#dayHint");
  const answers = ["stark","stärke","stark wie natur","tapfer"]; // Platzhalter – austauschbar
  qs("#f7").addEventListener("submit", e=>{
    e.preventDefault();
    const val = (new FormData(e.currentTarget).get("code")||"").toString().trim().toLowerCase();
    if(answers.includes(val)){ hint.textContent="Jawoll!"; api.solved(); }
    else { hint.textContent="Knobeln! (Du kannst die gültigen Antworten im Code anpassen)"; }
  });
}

/* Tag 8 – Finale (erscheint zusätzlich automatisch am 23.09.) */
function buildPuzzle_8(root, api){
  root.innerHTML = `
    <p>Letzte Etappe! Wenn alle Badges grün sind, erscheint unten die Gratulation.</p>
    <p class="hint">Du kannst Tag 8 auch direkt am 23.09. öffnen.</p>`;
}

/* ====== Actions / Buttons ====== */
function initActions(){
  qs("#prevDay").addEventListener("click", ()=>{ currentIndex=Math.max(0,currentIndex-1); mountDay(); renderNav(); });
  qs("#nextDay").addEventListener("click", ()=>{ currentIndex=Math.min(unlockedIndex(),currentIndex+1); mountDay(); renderNav(); });
  qs("#resetBtn").addEventListener("click", ()=>{ localStorage.removeItem("bdayDailyState"); location.reload(); });
  qs("#replayBtn").addEventListener("click", ()=>{ localStorage.removeItem("bdayDailyState"); location.reload(); });
  qs("#shareBtn").addEventListener("click", async ()=>{
    const text = "Ich habe die Geburtstags-Quest gelöst! 🎉";
    const url = location.href;
    if(navigator.share){ try{ await navigator.share({title:document.title, text, url}); }catch(e){} }
    else { navigator.clipboard?.writeText(url); alert("Link kopiert!"); }
  });
  qs("#aboutBtn").addEventListener("click", ()=>qs("#about").showModal());
}

/* ====== Init ====== */
function init(){
  // Ersten freigeschalteten Tag wählen
  currentIndex = Math.max(0, Math.min(unlockedIndex(), DAYS.length-1));
  renderNav(); renderProgress(); mountDay(); maybeShowFinal();
  tickCountdown(); setInterval(tickCountdown, 1000);
  initActions();
}
document.addEventListener("DOMContentLoaded", init);
