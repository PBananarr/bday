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
        { label: "Ihn packen und raus in den Gang!", to: "s1", effect: "door" },
        { label: "Allein los", to: "d1", effect: "scare" },
        { label: "Nach Hilfe rufen", to: "d2", effect: "scare" },
        { label: "Reglos lauschen, ob „es“ näher kommt", to: "d3", effect: "blood" }
      ]
    },

    s1: {
      type: "room",
      id: "s1",
      title: "Pflegestation A – Rollwagen",
      text: "Ein rostiger Rollstuhl, verstreute Akten, ein altes Namensschild: „Sunny Meadows Mental Institution“. Auf einem Klemmbrett steht: „Patient X – Bindung an Auslöser“ Dein Freund zuckt im Schlaf, die Schatten zucken mit.",
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
      text: "Verblasster Gebäudeplan: Kapelle, Verwaltung, Therapie, Heizungsraum, Isoliertrakt (Keller). Eine handschriftliche Notiz streift den Kapellenflur. Draußen klingt der Wind wie Atem.",
      choices: [
        { label: "Zur Kapelle", to: "s3", effect: "door" },
        { label: "In den Heizungsraum", to: "d7", effect: "blood" },
        { label: "Zur Verwaltung (Telefon?)", to: "d8", effect: "blood" },
        { label: "Durch den Kellergang", to: "d9", effect: "scare" }
      ]
    },

    s3: {
      type: "room",
      id: "s3",
      title: "Kapelle – Reste eines Bannkreises",
      text: "Wachsflecken, Kreidereste, verkohlte Seiten aus einer Bibel. Auf dem Boden ein zerrissener Bannkreis. Dein Freund stöhnt plötzlich: Hi...iilf mir!",
      choices: [
        { label: "Bei ihm bleiben, reden!", to: "d10", effect: "blood" },
        { label: "Kreidezeichen sauber nachziehen", to: "s4", effect: "door" },
        { label: "Auf der Orgel Töne spielen", to: "d11", effect: "scare" },
        { label: "Fenster aufmachen", to: "d12", effect: "blood" }
      ]
    },

    s4: {
      type: "room",
      id: "s4",
      title: "Therapieraum mit Einwegspiegel",
      text: "Der Bannkreis schließt sich mit einem scharfen Zischen. Ein Windstoß fegt die verkohlten Seiten fort, und der Boden unter dir vibriert. Als du blinzelst, stehst du in einem neuen Raum: sterile Fliesen, ein Einwegspiegel. dahinter flackerndes Licht. Auf einem Tonband: „Der Wirt stärkt, was ihn frisst.“ In Rot darüber: „Erst trennen, dann gehen.“",
      choices: [
        { label: "Spiegel zerschlagen – Reiz entziehen", to: "d13", effect: "scare" },
        { label: "Tonband abspielen", to: "d14", effect: "blood" },
        { label: "Tür verriegeln und abwarten", to: "d15", effect: "blood" },
        { label: "Spiegel abdecken", to: "s5", effect: "door" }
      ]
    },

    s5: {
      type: "room",
      id: "s5",
      title: "Isolierzelle",
      text: "Als du den Spiegel verhüllst, bricht das Flackern abrupt ab. Ein Zug reißt dich nach hinten, und im nächsten Augenblick stehst du in einer Isolierzelle. Dicke Mauern, die Luft stickig und abgestanden. Dein Freund liegt auf einer Pritsche, Schweiß auf der Stirn, fiebriger Blick. Um seine Handgelenke hängen alte, rissige Fixierbänder. In die Matratze ist ein Satz gekratzt: „Bindung = Opfer. Falsches Opfer bindet dich.“",
      choices: [
        { label: "Freund fixieren", to: "s6", effect: "door" },
        { label: "Ihn wachrütteln, bei dir behalten", to: "d16", effect: "blood" },
        { label: "Ein Gebet versuchen", to: "d17", effect: "scare" },
        { label: "Durch die Ritze spähen", to: "d18", effect: "scare" }
      ]
    },

    s6: {
      type: "room",
      id: "s6",
      title: "Versorgungstrakt – Alter OP",
      text: "Kaum dass die letzten Riemen geschlossen sind, verändert sich der Raum. Kalte OP-Lampe, rostige Instrumente, ein Kreidekreis-Fragment am Boden. In einer Patientenakte steht: „Es bleibt, solange der Wirt bleibt.",
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
      text: "Der Boden bebt, die OP-Wände reißen auf, und du stehst in einem runden Saal. " +
         "Vier steinerne Platten liegen im Kreis, in der Mitte die Trage mit deinem Freund. " +
         "Die Runen um ihn glimmen unruhig, reißen auf und schließen sich wieder, als würden sie jede Wahl akzeptieren. " +
         "Ein Riss in der Wand öffnet einen Gang, kalte Luft dringt herein. " +
         "Über allem die Schriftzüge, krakelig, drohend: " +
        "„Ein Leben löst das andere.“ " +
         "Dein Freund röchelt, kaum hörbar – und der Raum scheint auf deine Entscheidung zu warten.",
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
      text: "Du stolperst hinaus in den Hof. Regen peitscht, der Boden ist aufgeweicht, jeder Schritt schwer. " +
       "Hinter dir ragt die Anstalt wie ein schwarzer Monolith, drohend und still. " +
       "Panisch rennst du Richtung Haupttor – doch der Matsch reißt dich zu Boden. " +
       "Ein lautes Knacken durchfährt dein Bein, Schmerz lässt dich aufschreien. " +
       "Keuchend kriechst du weiter, Meter um Meter. " +
       "Das Tor liegt vor dir, unscharf im Regen. " +
       "Ob du es jemals erreichen wirst, bleibt im Dunkel zurück.",
      /*choices: [
        { label: "Von vorn beginnen", to: "s0", effect: "door", restart: true }
      ]*/
    },

    /* ========================================================= */
    /* ===================== 24 EINZELTODE ===================== */
    /* ========================================================= */
    
    d1:  death(
      "Allein auf dem Gang", "Du sprintest aus der Tür und findest dich auf einem langen Gang wieder." +
      " Du siehst dich panisch um, und hörst von links erneut diesen dämonischen Schrei." +
      " Hastisch, wirfst du deinen Körper nach rechts und folgst der Dunkelheit." +
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
      "Nur kurz weg", "Du trittst in den Flur, nur ein schneller Blick, nur ein paar Sekunden. " +
      "Als du zurückkommst, ist der Rollstuhl leer. Ein Tropfen Blut zieht deine Augen nach oben. " +
      "Dein Freund hängt kopfüber an der Decke, Hals verdreht, Augen starr. " +
      "Noch bevor du schreien kannst, packen unsichtbare Hände auch dich, " +
      "reißen dich nach oben und brechen deinen Körper neben ihm. " +
      "Gemeinsam baumelt ihr, leise knarrend im Takt des Neonlichts."
    ),
    d7:  death(
      "Heizungsraum", "Die Treppe knarrt in einen Raum, der mehr nach Körper als nach Maschine riecht. " +
      "Rohre pfeifen wie Stimmen, und in den Wasserspuren spiegeln sich Formen, die nicht existieren sollten. " +
      "Du folgst dem Weg, in der Hoffnung etwas zur Rettung zu finden — stattdessen findest du Skalpelle, rostige Zangen und Namen an der Wand, " +
      "als wären sie dort festgetackert worden. " +
      "Etwas im Dunkel atmet im Takt der Maschine; als es dich bemerkt, verschluckt " +
      "die Luft den Ton deines Schreis. Du stolperst zurück, aber der Weg nach oben ist verschwommen, " +
      "als hätte jemand die Stufen weggeschüttelt. Das Licht flackert einmal — und die letzten Bilder sind Hände, " +
      "die dich mit ruhiger Gewissheit zurückziehen."
    ),
    d8:  death(
      "Verwaltung", "Du stöberst durch vergilbte Akten in der Verwaltung, in der Hoffnung auf einen Telefonanschluss, " +
      "einen Namen, irgendein Rettungsnetz. Die Akten sind mehr Notizen als Verwaltung: Experimente, Bindungstests, Notizen in hastiger Handschrift " +
      "und ein Foto, in dem dein Gesicht nur schlecht retuschiert scheint. " +
      "Du hebst das Telefon ab — kein Wählton, sondern ein Surren, das sich in deinen Kopf bohrt wie ein Defibrillator. " +
      "Stimmen aus den Lautsprechern nennen Protokolle, Termine, Preise für Seelen und Körper. " + 
      "Als du versuchst, das Telefon wegzulegen, klebt deine Hand daran — Papier, Telefon, Finger, alles eins. " +
      "Die Schublade fällt zu; die Verwaltung nimmt dich in ihre Akten auf."
    ),
    d9:  death(
      "Kellergang", "Der Kellergang ist eng; die Wände sind voller Zeichen, eingeritzt mit Fingernägeln oder Nadeln. " +
      "Du glaubst, schneller gehen zu können, doch der Gang dehnt sich in die Länge, als würde jemand am anderen Ende daran ziehen. " +
      "Unter deinen Sohlen knirscht etwas, das du nicht zuordnen kannst — härter als Knochen, weicher als Fleisch? " +
      "Mit jedem Meter wächst der Druck in deiner Lunge. Dein Magen fängt an zu spannen - er zieht sich zusammen und dehnt sich wieder. " +
      "Dein Darm vibriert im Körper und deine Nieren drücken schmerzend gegen die Wirbelsäule. Dein ganzer Körper fängt an sich aufzublähen " +
      "als würde 'Etwas' hinaus wollen. Das letzte was du spürst, ist das warme Blut in deinem Mund, welches du tief aus dem Körper nach oben würgst."
    ),
    d10: death(
      "Dämonisch", "Er reist die Augen auf – Sein lauter Schrei durchdringt den Raum. " +
      "Blut läuft aus seinen Augen, den Ohren und der Nase. " +
      "Er zuckt besessen am Boden, wühlt wild umher und kriegt eine Glasscherbe zu fassen. " +
      "Er umklammert sie so fest, das er fast seine Finger verliert und schlitzt dir damit den Hals auf."
    ),
    d11: death(
      "Orgelpunkt", "Dein Blick fällt auf die alte Orgel am Ende des Raumes. Staub liegt wie eine Decke auf den Tasten, doch noch " +
      "bevor du näher kommst, beginnen die Pfeifen von selbst zu spielen. Ein ohrenbetäubender Klang erfüllt den Raum, " +
      "und zwischen den tiefen Tönen erhebt sich eine Stimme – schrill, gebrochen, wie das Heulen einer Sterbenden. " +
      "Sie singt Namen, die du nie genannt hast, Erinnerungen, die niemand kennen dürfte, deine geheimsten Gedanken in grausamer Melodie. " +
      "Plötzlich schält sich aus dem Klang eine Gestalt: eine Banshee, zerzaust, bleich, mit weit aufgerissenem Mund. Ihr Schrei schneidet durch deine " +
      "Knochen, und ehe du reagieren kannst, ist sie über dir. Kalte Hände greifen, reißen. Du spürst, wie Glieder abgetrennt werden, " +
      "während sie weiter singt – jeder Ton zerfetzt ein Stück deines Körpers, bis nur noch ein Echo deines Schreis in der Kapelle zurückbleibt."
    ),
    d12: death(
      "Frische Luft", "Du reißt ein Fenster auf, die kalte Luft schneidet wie ein Versprechen. " +
      "Ein Wind kommt herein, aber er riecht nicht nach Regen — er riecht nach offenen Wunden und alten Gebeten. " +
      "Etwas kriecht mit hinein, wie ein Schatten auf der Flucht, und legt sich auf deine Schultern wie ein Umhang. " +
      "Du spürst es erst als Kälte, dann als Ziehen an deinem Nacken; du drehst dich um, und dort, am Fensterrahmen, stehen kleine Hände, " +
      "die nach dir greifen. Du versuchst zu schreien, doch die Luft hat bereits einen Namen für dich — und er ist nicht mehr deiner."
    ),
    d13: death(
      "Spiegelwelt", "Du hebst den Arm und zerschlägst den Einwegspiegel. Splitter regnen klirrend zu Boden – doch dein Spiegelbild bleibt stehen. " +
      "Es lächelt, streckt die Hände nach dir aus und kriecht durch die Bruchkante wie aus einer Wunde geboren. Bevor du schreien kannst, " +
      "packt es dich und reißt dich durch das Glas zurück. Dein Körper zersplittert wie der Spiegel selbst, in tausend glänzende Stücke. " +
      "Dein letzter Anblick: dutzende Versionen von dir, die in der Dunkelheit lachen und sich gegenseitig zerfleischen."
    ),
    d14: death(
      "Aufnahme läuft", "Das Tonband knackt, und eine Stimme setzt ein – tief, kalt, das monotone Murmeln eines Arztes. " +
      "Er spricht in klinischen Protokollen, als ob er einen Patienten seziert: ‚Subjekt reagiert kaum noch. Schnitt tiefer. " +
      "Mehr Druck.‘ Zwischen den Worten hörst du Schreie, metallisches Klirren, das Quietschen von Instrumenten. Du willst das Gerät stoppen, " +
      "doch die Riemen des Abspielgeräts schlingen sich um deine Handgelenke. Mit einem Ruck wirst du zurückgerissen – und findest dich auf einem alten, " +
      "blutbefleckten Patiententisch wieder. Über dir steht er: weißer Kittel voller Flecken, Augen hohl, Mund lächelnd. In der einen Hand " +
      "hält er eine Säge, in der anderen eine Spritze. ‚Endlich bist du da‘, flüstert er, während die erste Klinge dein Fleisch berührt und die " +
      "Aufnahme weiterläuft – diesmal mit deinen eigenen Schreien."
    ),
    d15: death(
      "Verkeilt", "Du verriegelst die Tür, atmest erleichtert aus. Doch die Wände beginnen, sich zu bewegen, " +
      "als hätten sie genug von deinem Atem. Das Schloss klackt immer tiefer, als würde es dich festnageln. " +
      "Plötzlich springen Metallbolzen aus dem Rahmen, bohren sich durch deine Arme und Beine. Du bist fixiert, " +
      "aufgespießt wie ein Präparat. Die Wände pressen sich weiter zusammen, deine Rippen brechen, deine Organe quetschen sich durch " +
      "jede Öffnung deines Körpers. Dein Schrei hallt nur kurz – dann ist da nur noch ein leises Knacken von Knochen im engen Raum."
    ),
    d16: death(
      "Falsches Wecken", "Du rüttelst ihn grob, rufst verzweifelt seinen Namen. Seine Augen reißen auf – pechschwarz, ohne Pupillen. " +
      "Ein dämonisches Grinsen breitet sich über sein Gesicht aus. Mit unnatürlicher Kraft springt er dich an, beißt dir " +
      "Stücke Fleisch aus der Schulter, schlägt dir die Schädeldecke gegen den Boden. Er bricht deine Arme, als wären sie Spielzeug. " +
      "Dein letzter Gedanke: Dies ist nicht mehr dein Freund – sondern das Ding, das ihn bewohnt hat. Es zerrt deine Eingeweide heraus, während du noch lebst."
    ),
    d17: death(
      "Gebetsmühle", "Du schließt die Augen, beginnst zu beten. Doch die Worte verdrehen sich auf deiner Zunge, kehren falsch zurück. " +
      "Aus den Schatten tritt eine Gestalt, Priesterkutte, Gesicht verbrannt, Augen leer. " +
      "Er lächelt und wiederholt dein Gebet – doch jedes Wort wird zum Fluch. Seine Hände reißen dir die Lippen auf, " +
      "reißen deine Zunge heraus und pressen sie in ein Ritualbuch. Du würgst Blut, während deine Worte aus deinem eigenen " +
      "Fleisch neu geschrieben werden. Dein Körper fällt still, während die Gestalt weiter in deinem Namen betet."
    ),
    d18: death(
      "Spaltblick", "Du beugst dich an das Panzerglas, starrst durch den schmalen Riss. " +
      "Ein Auge blickt zurück – riesig, blutunterlaufen. Mit einem Ruck bricht das Glas, eine Hand fährt heraus " +
      "und greift direkt in deinen Schädel. Deine Knochen knacken wie Glas. Das Wesen zieht dein Gesicht durch die Spalte, " +
      "zerreißt die Haut und schabt die Muskeln vom Knochen. " +
      "Dein eigener Schädel splittert zwischen den Metallrahmen, während dein Körper kopflos zusammenbricht."
    ),
    d19: death(
      "Schockstarre", "Du setzt die Spritze, Adrenalin pumpt in seine Adern. Zuerst zuckt er, dann sitzt er kerzengerade. " +
      "Doch es ist nicht dein Freund, der aufsteht – es ist das, was in ihm gewohnt hat. " +
      "Mit einem Schrei zerreißt er seine eigenen Rippen, greift nach innen und reißt die Splitter heraus wie Messer. " +
      "Dann rammt er sie dir in Brust und Hals, immer wieder, bis dein Körper nicht mehr zu erkennen ist. " +
      "Dein Blut tropft wie eine Infusion auf den Boden, während er mit leerem Blick weiter sticht."
    ),
    d20: death(
      "Licht an", "Du wirfst den Generator an, die Neonröhren flackern. Für einen Moment scheint alles hell. " +
      "Doch im grellen Licht erkennst du die Kreaturen, die vorher verborgen waren: " +
      "dutzende Patienten ohne Haut, nur Muskeln und Nervenbahnen, die sich winden wie Schlangen. " +
      "Sie stürzen sich auf dich, reißen dir die Haut ab, bis du so aussiehst wie sie. " +
      "Deine Schreie hallen im Neonlicht, bis dein ganzer Körper ausgelöscht ist – nur ein blutiges, nacktes Nervengerüst bleibt zurück."
    ),
    d21: death(
      "Herausforderung angenommen", "Du reißt die Tür auf, brüllst die unsichtbare Präsenz heraus. Für einen Augenblick ist Stille. " +
      "Dann kracht ein Schrei zurück, so laut, dass deine Trommelfelle platzen. Etwas packt dich am Hals, " +
      "hebt dich hoch. Du siehst ein Gesicht, das keines ist – ein Maul voller Zähne, " +
      "immer wieder, Schichten über Schichten. Mit einem einzigen Biss reißt es dir den halben Körper ab. " +
      "Dein Unterleib fällt noch zuckend auf den Boden, während der obere Teil in der Finsternis verschwindet."
    ),
    d22: death(
      "Selbstopfer", "Du legst dich freiwillig in den Kreis, die Steine kalt unter deinem Rücken. " +
      "Für einen Moment spürst du Hoffnung, Erlösung. Dann schließen sich die Runen. " +
      "Flammen schlagen empor, reißen deine Haut in Fetzen, während unsichtbare Hände deine " +
      "Glieder auseinanderziehen. Dein Körper zerfällt Stück für Stück, als würdest du geopfert " +
      "wie ein Tier auf einem Altar. Dein letzter Blick fällt auf deinen Freund – du siehst " +
      "das Ihm das selbe Schicksal ereilt wie dir."
    ),
    d23: death(
      "Kreisbruch", "Du trittst den Bannkreis kaputt. Die Runen flackern, dann platzt der Boden auf wie eine klaffende Wunde. " +
      "Aus der Spalte schlagen Flammen und Hände aus purem Knochen. Sie packen dich, reißen dich hoch, " +
      "drücken dich quer durch die geborstenen Steine. Dein Körper bricht an den Kanten, Blut spritzt in den Kreis. " +
      "Dann schließen sich die Hände über dir, und dein Leib wird zwischen ihnen zermalmt – als Strafe dafür, " +
      "dass du das Ritual zerstört hast."
    ),
    d24: death(
      "Fluchtreflex",  "Du reißt die Tür auf – und Licht fällt herein. Hoffnung schießt dir durch die Brust, " +
      "du stolperst nach vorn, siehst den Ausgang, die Freiheit. Ein Schritt, zwei Schritte – " +
      "doch plötzlich klebt dein Fuß am Boden. Der Lichtstrahl flackert, entpuppt sich als brennendes Runenzeichen. " +
      "Risse öffnen sich im Boden, die Steine klappen wie Fallen zu. Unsichtbare Ketten schießen hoch, " +
      "reißen dir die Glieder auseinander, zerreißen Sehnen und Knochen. " +
      "Dein Schrei hallt noch, als die Tür lautlos ins Schloss fällt – und deine Hoffnung mit dir zerquetscht wird."
    )
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
