export const SPORT_DATA = {
  stations: [
    {
      id: "treadmill",
      name: "Laufband",
      chip: "Cardio",
      description: "Rechne dein Tempo: Wie lange brauchst du für 5 km bei 10 km/h?",
      type: "quiz",
      question: "Wie viele Minuten sind das?",
      choices: [20, 30, 37, 45],
      answer: 30
    },
    {
      id: "calories",
      name: "Kalorienwissen",
      chip: "Wissen",
      description: "30 Minuten Radfahren (moderat): Wie viele Kalorien verbrennt man ungefähr?",
      type: "quiz",
      question: "Wähle die beste Schätzung",
      choices: [120, 260, 400, 700],
      answer: 260
    },
    {
      id: "yoga",
      name: "Plank",
      chip: "Core",
      description: "Touch & Hold:<br>Zeit ein wenig durchzuatmen!",
      type: "hold",
      seconds: 37
    },
    {
      id: "boxing",
      name: "Boxsack",
      chip: "Kombi",
      description: "Treffe 3x Links u. 7x Rechts <br>... in 3 Sekunden. 😁",
      type: "combo",
      left: 3,
      right: 7,
      seconds: 3
    }
  ],
  challenge37: [
    {
      id: "clicks37",
      title: "37 Click-Jacks",
      description: "Klicke den Button 37×. Zeitlimit: 20 Sek.",
      target: 37,
      seconds: 20
    },
    {
      id: "moving37",
      title: "Moving Target 37%",
      description: "Bewegte Kugel auf der Leiste. Stoppe sie bei 37% (±1%).",
      tolerance: 1
    },
    {
      id: "heartrate37",
      title: "Herzfrequenz-Stop bei 37",
      description: "Starte den Monitor und stoppe genau bei 37 BPM.",
      min: 20,
      max: 60
    }
  ]
};