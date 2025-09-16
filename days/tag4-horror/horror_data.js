// ======= horror_data.js (nur Daten/Config) =======
export const HORROR_CONFIG = {
  // Defaults / Schalter
  DEFAULT_SCARES: true,
  DEFAULT_BLOOD: false,

  // Random-Scare-Intervall (Millisekunden)
  RANDOM_SCARE_MIN_MS: 8000,
  RANDOM_SCARE_MAX_MS: 22000,

  // Wohin führt "Exit" im Age-Gate?
  AGE_EXIT_URL: 'https://pbananarr.github.io/bday/',

  // (optional, für später) Item-Bilder & -Namen
  USE_ITEM_IMAGES: true,
  IMG_BASE: 'days/tag4-horror/picHorror/',
  ASSET_VERSION: '1',
  ITEMS: [
    { key:'affenpfote', name:'Affenpfote', emoji:'🖐️', img:'affenpfote.png' },
    { key:'tarot',      name:'Tarot-Karten', emoji:'🃏', img:'tarot.png' },
    { key:'kruzifix',   name:'Kruzifix',     emoji:'✝️', img:'kruzifix.png' },
    { key:'spieluhr',   name:'Spieluhr',     emoji:'🎶', img:'spieluhr.png' },
  ]
};

// Kleiner Helfer: hängt ?v=… an und baut vollständige IMG-URLs
(function seedAssets(cfg){
  const withV = (url)=> url + (url.includes('?')?'&':'?') + 'v=' + cfg.ASSET_VERSION;
  cfg.withV = withV;
  cfg.ITEMS = cfg.ITEMS.map(it => ({
    ...it,
    img: cfg.IMG_BASE ? withV(cfg.IMG_BASE + it.img) : withV(it.img)
  }));
})(HORROR_CONFIG);
