// Teil A — Regel der 3 (in Reihenfolge der Dringlichkeit)
export const RULE_OF_THREE = [
  { key: "air",   label: "Ohne Luft (Atem) – ~3 Minuten" },
  { key: "shelter", label: "Ohne Schutz/Unterkühlung – ~3 Stunden" },
  { key: "water", label: "Ohne Wasser – ~3 Tage" },
  { key: "food",  label: "Ohne Nahrung – ~3 Wochen" },
];

// Korrekte Reihenfolge der Keys (dringend → weniger dringend)
export const RULE_OF_THREE_ORDER = ["air", "shelter", "water", "food"];

// Teil B — Zunderwahl (Mehrfachauswahl; genau 2 sind korrekt)
export const TINDER_OPTIONS = [
  { key: "birch",   label: "Birkenrinde (frisch vom Stamm)" , correct: true },
  { key: "cotton",  label: "Baumwoll-Zunder (mit Wachs/Harz imprägniert)" , correct: true },
  { key: "mosswet", label: "Feuchtes Moos" , correct: false },
  { key: "needles", label: "Frische Tannennadeln" , correct: false },
  { key: "fern",    label: "Farnblätter" , correct: false },
  { key: "grasswet",label: "Nasses Gras" , correct: false },
];

// Teil C — Morse
export const MORSE_HINT = "··· --- ···";
export const MORSE_ANSWER = "sos";  // Vergleich in Kleinschreibung
