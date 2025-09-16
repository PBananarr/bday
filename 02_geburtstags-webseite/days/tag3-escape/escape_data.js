/* ===================== escape_data.js ===================== */


export const escape_STORY = {
  meta: {
    title: "Sunny-Meadow – Letzte Visite",
    maxStepsToWin: 8
  },

  start: "s0",

  scenes: {
    /* ===================== GOLDENER PFAD (9 Seiten) ===================== */
    s0: {
      type: "room",
      id: "s0",
      title: "Aufwachen im Ostflügel",
      text: "Kalter Linoleum, abblätternde Farbe. Du öffnest die Augen: verlassene Nervenheilanstalt. Neben dir liegt dein bester Freund – bewusstlos, Atem flach. Aus den Korridoren kriecht ein dämonischer Schrei, der die Notlichter flackern lässt.",
      choices: [
        { label: "March-Schema anwenden – Freund auf Gang zerren!", to: "s1", effect: "door" },
        { label: "Allein fliehen – raus hier!", to: "d1", effect: "scare" },
        { label: "Nach Hilfe rufen", to: "d2", effect: "scare" },
        { label: "Reglos lauschen, ob „es“ näher kommt", to: "d3", effect: "blood" }
      ]
    },

    s1: {
      type: "room",
      id: "s1",
      title: "Pflegestation A – Rollwagen",
      text: "Ein rostiger Rollstuhl, verstreute Akten, ein altes Namensschild: „Sunny Meadows Mental Institution“. Auf einem Klemmbrett steht: „Patient X – Bindung an Auslöser, Berührung verstärkt Phänomen.“ Dein Freund zuckt im Schlaf, die Schatten zucken mit.",
      choices: [
        { label: "Wasser suchen, ihn aufwecken", to: "d4", effect: "blood" },
        { label: "Laut die Schränke durchsuchen", to: "d5", effect: "scare" },
        { label: "Freund in den Rollstuhl und weiter", to: "s2", effect: "door" },
        { label: "Ihn kurz liegen lassen, Umgebung checken", to: "d6", effect: "blood" }
      ]
    },

    s2: {
      type: "room",
      id: "s2",
      title: "Stationsplan",
      text: "Ein verblasster Gebäudeplan: Kapelle, Verwaltung, Therapieräume, Heizungskeller, „Isoliertrakt“. Ein fett umrandeter Korridor trägt die Handnotiz: „Ritualreste → Kapelle“. Draußen heult etwas wie Wind – oder Atmen?",
      choices: [
        { label: "Zur Kapelle – vielleicht ein Schutzritual", to: "s3", effect: "door" },
        { label: "In den Heizungskeller", to: "d7", effect: "blood" },
        { label: "Zur Verwaltung (Telefon?)", to: "d8", effect: "blood" },
        { label: "Durch den Kellergang abkürzen", to: "d9", effect: "scare" }
      ]
    },

    s3: {
      type: "room",
      id: "s3",
      title: "Kapelle – Reste eines Bannkreises",
      text: "Wachsflecken, Kreidereste, verkohlte Seiten aus einer Bibel. Auf dem Boden ein zerrissener Bannkreis. Dein Freund stöhnt plötzlich: Hi...iilf mir! Ein Randnotizfetzen: „Kreis erneuern → Herz nicht berühren.“",
      choices: [
        { label: "Besten Freund ansprechen!", to: "d10", effect: "blood" },
        { label: "Kreidezeichen sauber nachziehen", to: "s4", effect: "door" },
        { label: "Auf der Orgel Töne spielen", to: "d11", effect: "scare" },
        { label: "Fenster öffnen, frische Luft reinlassen", to: "d12", effect: "blood" }
      ]
    },

    s4: {
      type: "room",
      id: "s4",
      title: "Therapieraum mit Einwegspiegel",
      text: "Hinter dem Spiegel flackert es, als ob jemand dicht dahinter stünde. Auf einem Tonband: „Der Wirt stärkt, was ihn frisst.“ In Rot: „Erst trennen, dann gehen.“",
      choices: [
        { label: "Spiegel zerschlagen", to: "d13", effect: "scare" },
        { label: "Tonband abspielen", to: "d14", effect: "blood" },
        { label: "Tür verriegeln und abwarten", to: "d15", effect: "blood" },
        { label: "Spiegel abdecken – Reiz entziehen", to: "s5", effect: "door" }
      ]
    },

    s5: {
      type: "room",
      id: "s5",
      title: "Isolierzelle",
      text: "Schalldichte Wände, Ritzen im Panzerglas, aus denen Flüstern sickert. Dein Freund fiebert. Um seine Handgelenke alte, lederne Fixierbänder. Ein Schriftzug in die Matratze geritzt: „Bindung = Opfer. Falsches Opfer bindet dich.“",
      choices: [
        { label: "Freund fixieren – Bindung kontrollieren", to: "s6", effect: "door" },
        { label: "Ihn wachrütteln, bei dir behalten", to: "d16", effect: "blood" },
        { label: "Gebet sprechen, Augen schließen", to: "d17", effect: "scare" },
        { label: "Durch die Ritze spähen", to: "d18", effect: "scare" }
      ]
    },

    s6: {
      type: "room",
      id: "s6",
      title: "Versorgungstrakt – Alter OP",
      text: "Kalte OP-Lampe, rostige Instrumente, ein Kreidekreis-Fragment am Boden. In einer Patientenakte: „Das Ding will bleiben. Es geht nur, wenn der Wirt nicht mehr hier ist.“ Dein Magen dreht sich – dein Freund ist der Wirt.",
      choices: [
        { label: "Adrenalin injizieren (ihn stabilisieren)", to: "d19", effect: "blood" },
        { label: "Schutzkreis vollenden, Trage in die Mitte", to: "s7", effect: "door" },
        { label: "Notgenerator starten (mehr Licht!)", to: "d20", effect: "blood" },
        { label: "Tür aufreißen und das Wesen herausfordern", to: "d21", effect: "scare" }
      ]
    },

    s7: {
      type: "room",
      id: "s7",
      title: "Ritualraum – Entscheidung",
      text: "Vier Opferplatten, kreisförmig angeordnet. In der Mitte passt genau eine Trage. An der Wand in krakeliger Schrift: „Ein Leben löst das andere. Der Kreis nimmt, was du liebst, und lässt dich gehen.“ Dein Freund atmet kaum noch.",
      choices: [
        { label: "Dich opfern – ihn retten", to: "d22", effect: "blood" },
        { label: "Den Kreis zerstören – niemand opfert jemand", to: "d23", effect: "scare" },
        { label: "Ihn opfern – den Kreis schließen", to: "s8", effect: "door" },
        { label: "Fliehen, bevor etwas passiert", to: "d24", effect: "scare" }
      ]
    },

    s8: {
      type: "final",
      id: "s8",
      title: "Kaltes Morgenlicht",
      text: "Die Luft wird schwer und dann plötzlich leicht. Etwas löst sich aus der Welt. Die Türen entsperren. Du stehst im Hof, grauer Himmel, Vogelruf. Hinter dir: Stille. Du lebst – und trägst sie bei dir.",
      choices: [
        { label: "Von vorn beginnen", to: "s0", effect: "door", restart: true }
      ]
    },

    /* ===================== 24 EINZELTODE ===================== */
    d1:  death(
      "Allein auf dem Gang", "Du sprintest aus der Tür und findest dich auf einem langen Gang wieder." +
      " Du siehst dich panisch um, und hörst von links erneut diesen dämonischen Schrei." +
      " Du fliest nach rechts und folgst panisch der Dunkelheit." +
      " Plötzlich stehst du in einer Sackgasse vor einer Tür. Du reist Sie auf und stürmst hinein." +
      " Ein leises, kraftloses Ächzen begrüßt dich – du bemerkst das du im selben Raum gelandet bist, aus dem du zu fliehen versucht hast."
    ),
    d2:  death(
      "Hilfe…", "Hiiiiiilfeeee.... " +
      "Angestrengt lauschst du zur Tür. " +
      "Plötzlich hörst du es, erst leise, in weiter Ferne.. dann zunehmend lauter... " + 
      "Tok...... Tok...... Tok.... Tok...Tok....TOK TOK TOk TOK TOKTOKTOTKTOTKTOK " +
      "... .... .... die Tür springt auf, etwas packt dich und zerrt dich in den Gang. " + 
      "Hiiiiiiillllfeeeeeeeeee... ... .. "
    ),
    d3:  death(
      "Lauschangriff", "Angestrengt lauschst du Richtung Tür. " +
      "Der dämonische Schrei, ging dir durch den ganzen Körper. " +
      "Du spürst wie du anfängst zu zittern. Kalter Schweis, läuft deinen Körper hinab. " + 
      "Dann... hörst du 'es' hinter dir...."
    ),
    d4:  death(
      "Wachküssen verboten", "Du siehst dich um und entdeckst einen tropfenden Wasserhahn. " +
      "Schnell eilst du dahin und drehst das zahnrad-ähnliche Ventil quitschend nach rechts. " +
      "Ein wenig Wasser, kommt aus dem Hahn. Es hat einen beißenden Geruch. " + 
      "Du formst deine Hände zu einer Schale und lässt ein wenig hineinlaufen. " +
      "Als du dich umdrehen willst, bemerkst du, das dein bester Freund neben dir steht und mit einem hämischen Grinsen anstarrt. " +
      "... Pierre?, fragst du abgehackt mit zittriger Stimme...  – die letzten Worte, die deinen Mund je verlassen haben "
    ),
    d5:  death(
      "Klappernde Schränke", "Panisch beginnst du die umliegenden Schränke zu durch wühlen. " +
      "Die Hoffnung etwas zu finden, damit das zucken endlich aufhört, lässt dich vergessen wie laut du dich im Moment verhältst. " + 
      "Plötzlich wird dir bewusst, das nicht du es bist, die laut die Schränke durch wühlt. Etwas ... Anderes, hat ebenfalls damit begonnen. " +
      "Wenige Sekunden, ist dein Schrei das letzte was man auf der Pflegestation A hören konnte. "
    ),
    d6:  death(
      "Nur kurz weg", "Als du zurückkommst, bist du schon da – an der Decke."
    ),
    d7:  death("Heizungskeller", "Die Treppe endet. Nicht da, wo du dachtest."),
    d8:  death("Verwaltung", "Das Telefon hat Wählton. Es wählt dich."),
    d9:  death("Kellergang", "Abkürzungen sind Kreidezeichnungen in Fleisch."),
    d10: death(
      "Dämonisch", "Er reist die Augen auf – Sein lauter Schrei durchdringt den Raum. " +
      "Blut läuft aus seinen Augen, den Ohren und der Nase. " +
      "Er zuckt besessen am Boden, wühlt wild umher und kriegt eine Glasscherbe zu fassen. " +
      "Er umklammert sie so fest, das er fast seine Finger verliert und schlitzt dir damit den Hals auf."
    ),
    d11: death("Orgelpunkt", "Der Ton hält an, auch wenn du es nicht mehr tust."),
    d12: death("Frische Luft", "Etwas kriecht mit herein und bleibt."),
    d13: death("Spiegelwelt", "Du zerbrichst das Glas. Es setzt dich anders zusammen."),
    d14: death("Aufnahme läuft", "Die Stimme auf dem Band hört dich nach."),
    d15: death("Verkeilt", "Verriegelt, verriegelt, verriegelt – verendet."),
    d16: death("Falsches Wecken", "Er kommt zu sich. Und zu dir."),
    d17: death("Gebetsmühle", "Worte zählen nicht, wenn der Mund nicht deiner ist."),
    d18: death("Spaltblick", "Ein Auge blickt zurück. Dein Auge."),
    d19: death("Schockstarre", "Adrenalin weckt zwei Herzen. Deins verliert."),
    d20: death("Licht an", "Helligkeit zeigt nur, wie nah es ist."),
    d21: death("Herausforderung angenommen", "Es liebt Mut. Zum Fressen gern."),
    d22: death("Selbstopfer", "Du legst dich in die Mitte. Es nimmt dich beim Wort."),
    d23: death("Kreisbruch", "Was gebunden war, wird frei. Du machst es frei."),
    d24: death("Fluchtreflex", "Die Tür geht auf. Die Zähne auch.")
  }
};

// kompakte Hilfsfunktion für Todes-Szenen
function death(title, text) {
  return {
    type: "death",
    title,
    text,
  };
}
