// src/data/trainings.js

export const trainings = [
  {
    id: "accountmanagement",
    title: "Accountmanagement Training",
    description:
      "Ontwikkel het vermogen om klanten écht te begrijpen, relaties te verdiepen en strategische groei te realiseren. Deze training combineert inzicht, reflectie en actie – in Cyntra-stijl.",
    color: "#D6B48E",
    modules: [
      // ================================
      // MODULE 1
      // ================================
      {
        id: "1",
        title: "De Fundamenten van Modern Accountmanagement",
        theory: [
          "Succesvolle accountmanagers zijn geen verkopers, maar strategische partners. Ze begrijpen de wereld van hun klant, denken vooruit en bouwen vertrouwen dat verder gaat dan een transactie.",
          "Accountmanagement draait om drie pijlers: inzicht, waarde en relatie. Inzicht in de klant, waarde leveren die ertoe doet en relaties onderhouden die wederzijds groeien.",
          "De sleutel is consistentie: niet één groot gebaar, maar tientallen kleine momenten waarin je betrouwbaarheid, interesse en strategisch denken laat zien."
        ],
        reflections: [
          "Hoe goed ken jij de echte doelen van je topklanten?",
          "Wat doe jij vandaag dat écht waarde toevoegt voor hen – los van directe verkoop?"
        ],
        quiz: [
          {
            question: "Wat is het belangrijkste doel van modern accountmanagement?",
            options: [
              "Zoveel mogelijk producten verkopen aan bestaande klanten",
              "Relaties opbouwen die leiden tot duurzame groei voor beide partijen",
              "Zorgen dat de klant altijd korting krijgt"
            ],
            correctAnswer: 1,
            feedback: [
              "❌ Verkoop is slechts een resultaat, geen doel.",
              "✅ Juist – moderne accountmanagers bouwen waardevolle relaties die groei opleveren.",
              "❌ Kortingen bouwen geen relaties, ze verlagen vertrouwen."
            ]
          },
          {
            question: "Wat kenmerkt een strategische accountmanager?",
            options: [
              "Reageert snel op vragen van klanten",
              "Denkt mee over de toekomst van de klant",
              "Stuurt vooral op korte termijn targets"
            ],
            correctAnswer: 1,
            feedback: [
              "⚠️ Reageren is goed, maar nog reactief.",
              "✅ Precies – de strategische accountmanager denkt vooruit.",
              "❌ Korte termijn denken ondermijnt langdurige relaties."
            ]
          }
        ],
        aiPrompt:
          "Vraag AI: ‘Analyseer hoe ik momenteel relaties opbouw met mijn top 3 klanten en geef 3 verbeterpunten om meer strategische waarde te bieden.’"
      },

      // ================================
      // MODULE 2
      // ================================
      {
        id: "2",
        title: "Klantinzicht & Marktanalyse",
        theory: [
          "De beste accountmanagers kennen hun klant beter dan de klant zichzelf kent. Ze herkennen trends, zien kansen en anticiperen op wat er komt.",
          "Klantinzicht is niet alleen data verzamelen, maar begrijpen wat de klant drijft – hun ambities, uitdagingen en besliscriteria.",
          "Door continu te luisteren, observeren en analyseren, ontdek je patronen die jouw strategie versterken."
        ],
        reflections: [
          "Welke trend in jouw markt heeft de grootste impact op je klanten?",
          "Hoe kun jij data vertalen naar actie in jouw accountplan?"
        ],
        quiz: [
          {
            question: "Wat is het verschil tussen klantdata en klantinzicht?",
            options: [
              "Data zijn cijfers, inzicht is begrip van gedrag en behoeften",
              "Er is geen verschil, ze betekenen hetzelfde",
              "Data zijn belangrijker dan inzicht"
            ],
            correctAnswer: 0,
            feedback: [
              "✅ Precies – inzicht is begrijpen wat data betekenen.",
              "❌ Er is een fundamenteel verschil.",
              "❌ Zonder inzicht blijft data betekenisloos."
            ]
          },
          {
            question: "Wat is een effectieve manier om klantinzicht te vergroten?",
            options: [
              "Meer productinformatie sturen",
              "Klantinterviews houden en observaties doen",
              "Korting geven om feedback te krijgen"
            ],
            correctAnswer: 1,
            feedback: [
              "❌ Dat versterkt jouw inzicht niet.",
              "✅ Juist – de beste inzichten komen uit échte gesprekken.",
              "⚠️ Korting kan helpen, maar vervormt vaak de feedback."
            ]
          }
        ],
        aiPrompt:
          "Laat AI jouw top 5 klanten analyseren en benoem voor elke klant één trend die jij kunt benutten in je strategie."
      },

      // ================================
      // MODULE 3
      // ================================
      {
        id: "3",
        title: "Communicatie & Vertrouwen",
        theory: [
          "Goede communicatie is de ruggengraat van elk partnerschap. Maar écht luisteren is zeldzaam – en precies dat maakt het krachtig.",
          "Vertrouwen ontstaat wanneer woorden, daden en resultaten in lijn zijn. Consistentie is geloofwaardigheid in actie.",
          "Gebruik gesprekken niet om te overtuigen, maar om te begrijpen. Een klant die zich gehoord voelt, is al halverwege overtuigd."
        ],
        reflections: [
          "Hoe vaak stel jij echt open vragen zonder direct naar een oplossing te sturen?",
          "Wat zou er gebeuren als je meer tijd zou nemen om de klant te laten praten?"
        ],
        quiz: [
          {
            question: "Wat is de meest effectieve manier om vertrouwen op te bouwen?",
            options: [
              "Altijd direct een oplossing bieden",
              "Belofte en uitvoering consistent laten overeenkomen",
              "Zoveel mogelijk contactmomenten creëren"
            ],
            correctAnswer: 1,
            feedback: [
              "⚠️ Soms goed, maar zonder consistentie breek je vertrouwen.",
              "✅ Exact – betrouwbaarheid creëert geloofwaardigheid.",
              "❌ Meer contact is niet per se beter contact."
            ]
          }
        ],
        aiPrompt:
          "Vraag AI: ‘Analyseer mijn laatste klantgesprek en geef suggesties om mijn communicatie empathischer te maken.’"
      },

      // ================================
      // MODULE 4
      // ================================
      {
        id: "4",
        title: "Klantwaarde & Strategie",
        theory: [
          "Elke klant is anders – en dat vraagt om strategische segmentatie. Niet iedereen verdient dezelfde aandacht, maar iedereen verdient relevantie.",
          "Door je klanten te groeperen op waarde, potentie en strategische fit, kun je je tijd effectiever inzetten.",
          "Een goed accountplan is geen document, maar een levend kompas dat meegroeit met jouw klant."
        ],
        reflections: [
          "Welke klantgroep levert de meeste waarde, en waarom?",
          "Hoe kun jij jouw accountstrategie dynamischer maken?"
        ],
        quiz: [
          {
            question: "Wat is het voordeel van klantsegmentatie?",
            options: [
              "Je kunt gerichter prioriteiten stellen en waarde leveren",
              "Je kunt sneller verkopen aan iedereen",
              "Het voorkomt dat je moet luisteren naar klanten"
            ],
            correctAnswer: 0,
            feedback: [
              "✅ Precies – focus vergroot relevantie en resultaat.",
              "❌ Onrealistisch – niet elke klant heeft dezelfde waarde.",
              "❌ Dat zou de kern van accountmanagement schaden."
            ]
          }
        ],
        aiPrompt:
          "Laat AI jouw klantenlijst segmenteren op omzetpotentieel en strategische fit, en geef advies over prioriteiten."
      },

      // ================================
      // MODULE 5
      // ================================
      {
        id: "5",
        title: "Relatiebeheer & Groei",
        theory: [
          "Een klantrelatie is als een ecosysteem: het groeit alleen als er balans is tussen geven en nemen.",
          "Door waarde te blijven toevoegen, versterk je loyaliteit. Maar vergeet niet: loyaliteit moet verdiend, niet gekocht worden.",
          "De beste accountmanagers zijn nieuwsgierig. Ze blijven leren, luisteren en anticiperen op verandering."
        ],
        reflections: [
          "Wat doe jij om je bestaande klanten te verrassen?",
          "Hoe kun jij proactiever inspelen op klantbehoeften?"
        ],
        quiz: [
          {
            question: "Wat is de sleutel tot langdurige klantrelaties?",
            options: [
              "Regelmatig korting aanbieden",
              "Eerlijkheid, betrouwbaarheid en continu waarde leveren",
              "Zoveel mogelijk upsells doen"
            ],
            correctAnswer: 1,
            feedback: [
              "❌ Prijs verlaagt waardeperceptie.",
              "✅ Exact – vertrouwen groeit door integriteit en consistentie.",
              "❌ Pushen ondermijnt vertrouwen."
            ]
          }
        ],
        aiPrompt:
          "Vraag AI: ‘Analyseer mijn klantportefeuille en geef suggesties voor cross-sell- en up-sellkansen op basis van klantwaarde.’"
      },

      // ================================
      // MODULE 6
      // ================================
      {
        id: "6",
        title: "Onderhandelen & Resultaatgerichtheid",
        theory: [
          "Onderhandelen is geen strijd, maar samenwerking. De beste uitkomsten ontstaan wanneer beide partijen winnen.",
          "Sterke onderhandelaars weten wat ze waard zijn én wat de klant waardevol vindt.",
          "Resultaatgerichtheid gaat niet om korte termijn winst, maar om het creëren van duurzame impact."
        ],
        reflections: [
          "Wat betekent winnen voor jou én voor je klant?",
          "Welke onderhandeling uit het verleden zou je vandaag anders aanpakken?"
        ],
        quiz: [
          {
            question: "Wat kenmerkt een effectieve onderhandeling?",
            options: [
              "Een compromis waarbij beide partijen waarde behouden",
              "Een situatie waarin jij altijd je zin krijgt",
              "Het vermijden van concessies"
            ],
            correctAnswer: 0,
            feedback: [
              "✅ Juist – win-win bouwt partnerschappen.",
              "❌ Dat breekt relaties af.",
              "❌ Geen concessies doen blokkeert samenwerking."
            ]
          }
        ],
        aiPrompt:
          "Laat AI jouw laatste deal analyseren en feedback geven over je onderhandelingsstrategie en waardecreatie."
      }
    ]
  }
];
