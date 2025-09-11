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
// Teil C — Morse
// ==============================
export const MORSE_HINT = "··· --- ···";
export const MORSE_ANSWER = "sos";  // Vergleich in Kleinschreibung
