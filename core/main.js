/* ====== Kalender & Konfiguration ====== */
const BIRTHDAY_ISO = "2025-09-23T00:00:00+02:00";
export const DAYS = [
  { key:"tag1-sternbild", date:"2025-09-16", title:"Tag 1 · Sternbild", badge:"🪴 Pflanzen-Profi" },
  { key:"tag2-survival",  date:"2025-09-17", title:"Tag 2 · Survival",  badge:"🧭 Pfadfinder/in" },
  { key:"tag3-ghost",     date:"2025-09-18", title:"Tag 3 · Geisterjagd", badge:"👻 Mutig" },
  { key:"tag4-wein",      date:"2025-09-19", title:"Tag 4 · Weinwahl", badge:"🥂 Weinliebhaberin" },
  { key:"tag5-sport",     date:"2025-09-20", title:"Tag 5 · Sport-Boost", badge:"💪 Durchzieher/in" },
  { key:"tag6-moto",      date:"2025-09-21", title:"Tag 6 · Motorrad-Safety", badge:"🏍️ Safety First" },
  { key:"tag7-exit",      date:"2025-09-22", title:"Tag 7 · Exit-Teaser", badge:"🧩 Rätselfuchs" },
  { key:"tag8-finale",    date:"2025-09-23", title:"Tag 8 · Finale", badge:"🎖️ Missionsabschluss" },
];
const TOTAL = DAYS.length;
const DEV = new URLSearchParams(location.search).get("dev") === "1";

/* ====== State ====== */
const qs = s => document.querySelector(s);
const state = JSON.parse(localStorage.getItem("bdayModState")||"{}");
const save = ()=>localStorage.setItem("bdayModState", JSON.stringify(state));
function setDone(key){ state[key]=true; save(); renderNav(); renderProgress(); maybeShowFinal(); }

/* ====== Zeit / Freischaltung ====== */
function todayISO(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function unlockedIndex(){
  if(DEV) return DAYS.length-1;
  const t=todayISO(); let idx=-1;
  for(let i=0;i<DAYS.length;i++) if(DAYS[i].date<=t) idx=i;
  return Math.max(idx,-1);
}

/* ====== Countdown ====== */
function tickCountdown(){
  const out = qs("#countdown");
  const target = new Date(BIRTHDAY_ISO).getTime();
  let delta = Math.max(0, target - Date.now());
  const d = Math.floor(delta / 86400000); delta -= d*86400000;
  const h = Math.floor(delta / 3600000);  delta -= h*3600000;
  const m = Math.floor(delta / 60000);    delta -= m*60000;
  const s = Math.floor(delta / 1000);
  out.textContent = `${d}T ${h}h ${m}m ${s}s`;
}

/* ====== Navigation ====== */
let currentIndex = Math.max(0, Math.min(unlockedIndex(), DAYS.length-1));
function renderNav(){
  const nav = qs("#dayNav");
  nav.innerHTML = "";
  const uIdx = unlockedIndex();
  DAYS.forEach((d,i)=>{
    const dot = document.createElement("button");
    dot.className = "daydot" + (i<=uIdx ? " unlocked" : "") + (state[d.key] ? " done" : "") + (i===currentIndex ? " active":"");
    dot.setAttribute("aria-label", `${d.title} (${d.date})`);
    dot.disabled = i>uIdx;
    dot.addEventListener("click", ()=>{ currentIndex=i; mount(); });
    nav.appendChild(dot);
  });
  qs("#devBadge").hidden = !DEV;
  qs("#dayLabel").textContent = `${DAYS[currentIndex].title} · ${DAYS[currentIndex].date}`;
  qs("#prevDay").disabled = currentIndex<=0;
  qs("#nextDay").disabled = currentIndex>=Math.min(uIdx, DAYS.length-1);
}
function renderProgress(){
  const done = DAYS.filter(d=>state[d.key]).length;
  qs("#totalCount").textContent = TOTAL;
  qs("#doneCount").textContent = done;
  qs("#progress").style.width = `${(done/TOTAL)*100}%`;
}

/* ====== Finale ====== */
function badgesRender(){
  const wrap = qs("#badges");
  wrap.innerHTML = "";
  DAYS.forEach(d=>{
    const el = document.createElement("span");
    el.className="badge";
    el.textContent = (state[d.key] ? "✔ " : "• ") + d.badge;
    wrap.appendChild(el);
  });
}
function confetti(count=120){
  const cont = qs("#confetti");
  const colors = ["#34d399","#60a5fa","#f472b6","#fbbf24","#a78bfa","#f87171"];
  for(let i=0;i<count;i++){
    const p=document.createElement("div");
    p.className="confetti";
    p.style.left=Math.random()*100+"vw";
    p.style.top="-10vh";
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    const dur=2.5+Math.random()*2.5, delay=Math.random()*0.8;
    p.style.animationDuration=dur+"s"; p.style.animationDelay=delay+"s";
    cont.appendChild(p);
    setTimeout(()=>p.remove(), (dur+delay)*1000+500);
  }
}
function maybeShowFinal(){
  const allDone = DAYS.every(d=>state[d.key]);
  const reached = todayISO() >= "2025-09-23";
  const final = qs("#final");
  if((allDone || reached) && final.hidden){
    final.hidden=false; badgesRender(); confetti();
  }
}

/* ====== Day Loader (dynamic import + CSS Umschalten) ====== */
let currentCleanup = null;
async function loadDay(i){
  const host = qs("#dayHost");
  host.innerHTML = "";

  // Sperre für Zukunftstage
  const uIdx = unlockedIndex();
  if(i>uIdx){
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
  qs("#day-style").href = `days/${DAYS[i].key}/${base}.css`;

  // Body-Klasse pro Tag für Themes
  setBodyTagClass(DAYS[i].key);

  // Vorherige Ressourcen säubern
  if(typeof currentCleanup === "function"){ try{ currentCleanup(); }catch{} }
  currentCleanup = null;

  // Modul laden
  try{
    const mod = await import(`../days/${DAYS[i].key}/${base}.js?v=${cacheBust()}`);
    const api = { solved: ()=>setDone(DAYS[i].key) };
    const cleanup = await mod.build(host, api);
    currentCleanup = typeof cleanup === "function" ? cleanup : null;
  } catch(err){
    console.warn("Tagesmodul fehlt oder Fehler:", err);
    host.innerHTML = `<section class="card lock">
      <h2>${DAYS[i].title}</h2>
      <p>Dieses Tages-Rätsel ist noch nicht bereit. (Datei: <code>${base}.js</code>)</p>
    </section>`;
    qs("#day-style").href = "";
  }
}

function setBodyTagClass(tagKey){
  // entferne alle tag- Klassen und setze neue
  document.body.className = document.body.className.split(" ").filter(c=>!c.startsWith("tag-")).join(" ").trim();
  if(tagKey) document.body.classList.add(`tag-${tagKey}`);
}
function short(key){ return key.split("-")[1]; }
function cacheBust(){ return state.__v || (state.__v=Date.now(), save(), state.__v); }

/* ====== Aktionen ====== */
function initActions(){
  qs("#prevDay").addEventListener("click", ()=>{ currentIndex=Math.max(0,currentIndex-1); mount(); });
  qs("#nextDay").addEventListener("click", ()=>{ currentIndex=Math.min(unlockedIndex(),currentIndex+1); mount(); });
  qs("#resetBtn").addEventListener("click", ()=>{ localStorage.removeItem("bdayModState"); location.reload(); });
  qs("#replayBtn").addEventListener("click", ()=>{ localStorage.removeItem("bdayModState"); location.reload(); });
  qs("#shareBtn").addEventListener("click", async ()=>{
    const text = "Ich habe die Geburtstags-Quest gelöst! 🎉";
    const url = location.href;
    if(navigator.share){ try{ await navigator.share({title:document.title, text, url}); }catch(e){} }
    else { navigator.clipboard?.writeText(url); alert("Link kopiert!"); }
  });
  qs("#aboutBtn").addEventListener("click", ()=>qs("#about").showModal());
}

/* ====== Mount / Init ====== */
async function mount(){
  renderNav(); renderProgress();
  await loadDay(currentIndex);
  maybeShowFinal();
}
document.addEventListener("DOMContentLoaded", ()=>{
  tickCountdown(); setInterval(tickCountdown, 1000);
  initActions();
  currentIndex = Math.max(0, Math.min(unlockedIndex(), DAYS.length-1));
  mount();
});
