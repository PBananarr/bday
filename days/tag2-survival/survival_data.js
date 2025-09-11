// ==============================
// Teil A — Regel der 3
// ==============================
export const RULE_OF_THREE = [
  { key: "fire",    label: "Feuer machen" },
  { key: "shelter", label: "Schutz vor Elementen" },
  { key: "water",   label: "Wasserbeschaffung" },
  { key: "food",    label: "Nahrung beschaffen" },
];

// Korrekte Reihenfolge der Keys (dringend → weniger dringend)
export const RULE_OF_THREE_ORDER = ["fire", "shelter", "water", "food"];

// ==============================
// Teil B — Improvisierte Werkzeuge (NEU)
// Drag & Drop: Items den richtigen Buckets zuordnen
// ==============================

// Buckets / Kategorien
export const B_TOOL_BUCKETS = [
  { key: "cut",      label: "🪨 Schneidwerkzeuge" },
  { key: "cordage",  label: "🌿 Schnüre & Seile" },
  { key: "impact",   label: "🔨 Schlag- & Grabwerkzeuge" },
  { key: "firecook", label: "🪵 Feuer- & Kochwerkzeuge" },
  { key: "multi",    label: "🛠 Multipurpose" },
];

// Items mit gültigen Zuordnungen
export const B_ITEMS = [
  { key: "flintknife", label: "Steinmesser (Feuerstein/Obsidian/Quarz)", accepts: ["cut"] },
  { key: "glass",      label: "Glasscherbe",                               accepts: ["cut"] },
  { key: "shellbone",  label: "Muschel / Knochen",                         accepts: ["cut"] },

  { key: "nettles",    label: "Pflanzenfasern (Brennnessel/Bast/Yucca)",   accepts: ["cordage"] },
  { key: "sinew",      label: "Tiersehne/Lederstreifen",                   accepts: ["cordage"] },
  { key: "clothes",    label: "Kleidungsfetzen / Schnürsenkel",            accepts: ["cordage"] },

  { key: "club",       label: "Knüppel / Schlagstock",                     accepts: ["impact"] },
  { key: "digstick",   label: "Grabstock (zugespitzter Ast)",              accepts: ["impact"] },
  { key: "hammer",     label: "Steinhammer",                                accepts: ["impact"] },

  { key: "woodbowl",   label: "Holzgefäß + heiße Steine (Wasser kochen)",  accepts: ["firecook"] },
  { key: "torch",      label: "Fackel (Harz / Öl / Fett)",                 accepts: ["firecook"] },
  { key: "handdrill",  label: "Feuerbohrer / Handdrill",                    accepts: ["firecook"] },

  { key: "spear",      label: "Speer (feuergehärtet)",                      accepts: ["multi"] },
  { key: "axe",        label: "Improvisierte Axt (Stein + Holz + Seil)",    accepts: ["multi"] },
  { key: "fishing",    label: "Angelhaken + Schnur (Knochen/Kleidung)",     accepts: ["multi"] },
];

// Regel: pro Bucket mindestens diese Anzahl korrekter Items
export const B_RULE = {
  minPerBucket: 2,
};

// Optionaler Tipp-Text
export const B_HINT = "Ziehe die Kärtchen zu den passenden Kategorien. Pro Kategorie brauchst du mindestens 2 korrekte Zuordnungen.";

// ==============================
// Teil C — Fortgeschritten: Wasserversorgung
// ==============================
export const WATER_HINT = "Beantworte die Aufgaben zur sicheren Wasserversorgung.";

export const C1_SIGNS = [
  { key: "trails",   label: "Frische Wildwechsel / Tierpfade",          correct: true },
  { key: "moss",     label: "Moos an der Nordseite von Bäumen",         correct: false },
  { key: "birds",    label: "Vogelflug am Morgen/Abend Richtung Tal",   correct: true },
  { key: "insects",  label: "Viele Insekten in der Dämmerung",          correct: true },
  { key: "northstar",label: "Polarstern (Richtung bestimmen)",          correct: false },
];

export const C2_FILTER_LAYERS = [
  { key: "coarse_sand", label: "Grober Sand" },
  { key: "fine_sand",   label: "Feiner Sand" },
  { key: "charcoal",    label: "Holzkohle" },
  { key: "cloth",       label: "Stoff / Tuch" },
];
// Korrekte Reihenfolge (1 → 4)
export const C2_FILTER_ORDER = ["coarse_sand", "fine_sand", "charcoal", "cloth"];

export const C3_SCENARIOS = [
  {
    key: "sodis",
    question: "Du hast nur eine klare PET-Flasche und volle Sonne, kein Brennstoff.",
    options: [
      { key: "boil",  label: "Abkochen" },
      { key: "sodis", label: "UV-Desinfektion (SODIS)" },
      { key: "chem",  label: "Jod/Chlor" },
    ],
    answer: "sodis",
  },
  {
    key: "solarstill",
    question: "Du hast Plane/Folie, Grube und Pflanzenmaterial, aber kein Feuer.",
    options: [
      { key: "solarstill", label: "Solarstill (Kondensgrube)" },
      { key: "boil",       label: "Abkochen" },
      { key: "filter",     label: "Nur Filtern" },
    ],
    answer: "solarstill",
  },
  {
    key: "distill",
    question: "Nur Salz- oder Brackwasser verfügbar (am Meer).",
    options: [
      { key: "distill", label: "Destillation" },
      { key: "filter",  label: "Nur Filtern" },
      { key: "sodis",   label: "UV-Desinfektion (SODIS)" },
    ],
    answer: "distill",
  },
];

export const C4_TIPS = [
  { key: "no_sea",          label: "Nie direkt Meerwasser trinken.",                 correct: true },
  { key: "snow_eat",        label: "Schnee/Eis direkt essen ist ideal.",            correct: false },
  { key: "char_filter",     label: "Holzkohle kann Gerüche/Gifte adsorbieren.",     correct: true },
  { key: "standing_ok",     label: "Stehendes Wasser ist so sicher wie fließendes.",correct: false },
  { key: "boil_after_filter",label:"Nach dem Filtern wenn möglich abkochen.",       correct: true },
];

// ==============================
// Teil D — Profi: Pflanzenerkennung
// ==============================
export const D_PLANT_PAIRS = [
  {
    key: "p1",
    title: "Paar 1",
    items: [
      {
        key: "petersilie",
        label: "Petersilie",
        latin: "Petroselinum crispum",
        src: "./img/survival/p1Petersilie.png",
        category: "edible",
      },
      {
        key: "hundspetersilie",
        label: "Hundspetersilie",
        latin: "Aethusa cynapium",
        src: "./img/survival/p1Hundspetersilie.png",
        category: "toxic",
      },
    ],
  },
  {
    key: "p2",
    title: "Paar 2",
    items: [
      {
        key: "baldrian",
        label: "Echter Baldrian",
        latin: "Valeriana officinalis",
        src: "./img/survival/p2Baldrian.png",
        category: "edible",  // Heilpflanze
      },
      {
        key: "schierling",
        label: "Gefleckter Schierling",
        latin: "Conium maculatum",
        src: "./img/survival/p2Schierling.png",
        category: "toxic",
      },
    ],
  },
  {
    key: "p3",
    title: "Paar 3",
    items: [
      {
        key: "baerlauch",
        label: "Bärlauch",
        latin: "Allium ursinum",
        src: "./img/survival/p3Baerlauch.png",
        category: "edible",
      },
      {
        key: "maiglocke",
        label: "Maiglöckchen",
        latin: "Convallaria majalis",
        src: "./img/survival/p3Maiglocke.png",
        category: "toxic",
      },
      // Optionaler zweiter Doppelgänger (falls du ihn nutzen willst):
      // { key: "herbstzeitlose", label: "Herbstzeitlose", latin: "Colchicum autumnale", src: "./img/survival/p3Herbstzeitlose.png", category: "toxic" },
    ],
  },
  {
    key: "p4",
    title: "Paar 4",
    items: [
      {
        key: "brennnessel",
        label: "Brennnessel",
        latin: "Urtica dioica",
        src: "./img/survival/p4Brennessel.png",
        category: "edible",
      },
      {
        key: "baerenklau",
        label: "Riesen-Bärenklau",
        latin: "Heracleum mantegazzianum",
        src: "./img/survival/p4Baerenklau.png",
        category: "toxic",
      },
    ],
  },
];

// Labels für die Auswahl
export const D_PLANT_CATEGORIES = {
  edible: "Essbare / Heilpflanze",
  toxic: "Giftiger Doppelgänger",
};

