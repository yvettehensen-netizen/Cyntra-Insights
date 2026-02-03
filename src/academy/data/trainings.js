// src/academy/data/trainings.jsx

export const trainings = [
  {
    id: "strategisch-klantpartnerschap",
    title: "Strategisch Klantpartnerschap – de Cyntra Training voor Accountmanagers",
    description:
      "Leer hoe je als moderne accountmanager niet alleen verkoopt, maar echte waarde creëert. Deze training helpt je om relaties te verdiepen, strategisch te denken en te groeien in impact — stap voor stap, module voor module.",
    color: "#D6B48E",
    modules: [
      // ================================
      // MODULE 1
      // ================================
      {
        id: "1",
        title: "De Fundamenten van Strategisch Klantpartnerschap",
        theory: [
          "Strategisch accountmanagement gaat niet over targets, maar over betekenis. Het begint met een fundamentele verschuiving: van verkopen naar verbinden. In deze module ontdek je dat langdurige klantrelaties niet gebouwd worden op deals, maar op begrip, betrouwbaarheid en consistentie.",
          "Een sterke accountmanager kent de wereld van zijn klant beter dan de klant zelf. Je begrijpt hun ambities, obstakels en motivaties – en denkt proactief met hen mee. Zo word je geen leverancier, maar een vertrouwde sparringpartner die groei mogelijk maakt.",
          "Een goede relatie vraagt om bewust handelen. Niet één groot gebaar, maar tientallen kleine momenten van aandacht, eerlijkheid en betrokkenheid. Dit zijn de bouwstenen van vertrouwen — en daarmee van duurzame groei.",
          "De basis van deze training ligt in jouw mindset. Wie jij bent in het contact met de klant bepaalt hoe diep de relatie gaat. Authenticiteit, empathie en strategisch denken vormen de drie pijlers waarop modern accountmanagement rust.",
          "Je gaat leren om niet alleen te reageren op wat klanten vragen, maar te anticiperen op wat ze nodig hebben. Dat is waar partnerschap begint — bij vooruitdenken, niet bij afwachten."
        ],
        reflections: [
          "Welke klant vertrouwt jou écht, en waarom denk je dat dat zo is?",
          "Wat betekent ‘waarde leveren’ voor jou in de praktijk van je werk?",
          "Waar merk jij dat je nog te reactief bent in klantcontact?"
        ],
        quiz: [
          {
            question: "Wat is het doel van strategisch accountmanagement?",
            options: [
              "Het behalen van zoveel mogelijk korte-termijnverkopen",
              "Het opbouwen van relaties die leiden tot duurzame groei en wederzijds vertrouwen",
              "Het overtuigen van klanten met scherpe prijzen en snelle deals"
            ],
            correctAnswer: 1,
            feedback: [
              "❌ Verkoop is een resultaat, geen doel. Strategisch denken gaat verder.",
              "✅ Juist — het draait om duurzame groei en samenwerking.",
              "❌ Prijsgericht werken ondermijnt vaak vertrouwen op lange termijn."
            ]
          },
          {
            question: "Wat is de kern van vertrouwen in klantrelaties?",
            options: [
              "Altijd direct een oplossing bieden",
              "Consistentie tussen woorden, daden en resultaten",
              "Zoveel mogelijk communiceren met de klant"
            ],
            correctAnswer: 1,
            feedback: [
              "⚠️ Oplossingen zijn belangrijk, maar niet de kern van vertrouwen.",
              "✅ Exact — consistentie creëert geloofwaardigheid.",
              "❌ Meer contactmomenten zonder inhoud bouwen geen vertrouwen."
            ]
          }
        ],
        aiPrompt:
          "Analyseer mijn huidige klantrelaties en geef suggesties hoe ik meer consistentie, betrouwbaarheid en strategische waarde kan toevoegen."
      },

      // ================================
      // MODULE 2
      // ================================
      {
        id: "2",
        title: "Klantinzicht & Marktbewustzijn",
        theory: [
          "Echte waarde begint met inzicht. Een strategische accountmanager kent zijn klant niet alleen op operationeel niveau, maar begrijpt de diepere drijfveren achter hun keuzes.",
          "Klantinzicht is meer dan data. Het is de vaardigheid om trends te herkennen, patronen te zien en daar betekenis aan te geven. Wat beweegt de markt waarin jouw klant zich bevindt? Welke ontwikkelingen vormen een risico — en waar liggen kansen?",
          "Door continu te luisteren, observeren en analyseren, ontwikkel je een vooruitziende blik. Daarmee kun je proactief meedenken met klanten, in plaats van reactief volgen.",
          "Een sterk klantinzicht stelt je in staat om niet alleen mee te bewegen met verandering, maar deze ook te voorspellen. Dat maakt jou tot een partner van strategische waarde, niet alleen vandaag, maar ook morgen."
        ],
        reflections: [
          "Welke trend beïnvloedt jouw klanten het meest op dit moment?",
          "Hoe gebruik jij data en observaties om klantgesprekken strategischer te maken?",
          "Wat zegt het gedrag van jouw klanten over hun echte prioriteiten?"
        ],
        quiz: [
          {
            question: "Wat is het verschil tussen klantdata en klantinzicht?",
            options: [
              "Data zijn cijfers, inzicht is betekenis",
              "Data en inzicht betekenen hetzelfde",
              "Inzicht is minder belangrijk dan data"
            ],
            correctAnswer: 0,
            feedback: [
              "✅ Precies — data is input, inzicht is interpretatie.",
              "❌ Nee, ze verschillen fundamenteel van elkaar.",
              "❌ Zonder inzicht blijft data waardeloos."
            ]
          },
          {
            question: "Wat maakt een accountmanager proactief?",
            options: [
              "Hij reageert snel op klantvragen",
              "Hij voorspelt klantbehoeften en bereidt acties vooraf voor",
              "Hij wacht tot de klant iets nodig heeft"
            ],
            correctAnswer: 1,
            feedback: [
              "⚠️ Reactief zijn helpt, maar is niet strategisch.",
              "✅ Correct — proactiviteit onderscheidt partners van leveranciers.",
              "❌ Afwachten verkleint je strategische rol."
            ]
          }
        ],
        aiPrompt:
          "Vat de belangrijkste trends in mijn markt samen en benoem drie klantkansen die ik strategisch kan benutten."
      },

      // ================================
      // MODULE 3
      // ================================
      {
        id: "3",
        title: "Communicatie & Vertrouwen",
        theory: [
          "Communicatie is de brug tussen kennis en relatie. Als accountmanager is luisteren vaak waardevoller dan spreken. Want pas wanneer je écht hoort wat er speelt, kun je richting geven die resoneert.",
          "Goede communicatie vraagt om empathie en discipline. Het betekent dat je open vragen stelt, ruimte laat voor stilte en actief reflecteert op wat de klant zegt.",
          "Vertrouwen ontstaat wanneer jouw woorden en daden op elkaar aansluiten. Je bouwt geloofwaardigheid door te doen wat je zegt — ook als niemand kijkt.",
          "Het doel van communicatie is niet overtuigen, maar begrijpen. Wanneer klanten zich gehoord en erkend voelen, ontstaat vanzelf invloed."
        ],
        reflections: [
          "Wat doe jij om klanten het gevoel te geven dat ze écht gehoord worden?",
          "In welke gesprekken merk je dat je te snel wilt overtuigen?",
          "Hoe kun je actief luisteren beter integreren in je dagelijkse gesprekken?"
        ],
        quiz: [
          {
            question: "Wat is de belangrijkste voorwaarde voor vertrouwen?",
            options: [
              "Vriendelijke communicatie",
              "Consistente daden die aansluiten bij beloften",
              "Altijd gelijk krijgen"
            ],
            correctAnswer: 1,
            feedback: [
              "⚠️ Vriendelijkheid helpt, maar vertrouwen vraagt om daden.",
              "✅ Juist — geloofwaardigheid komt uit consistent gedrag.",
              "❌ Dominantie schaadt relaties."
            ]
          }
        ],
        aiPrompt:
          "Analyseer mijn communicatiestijl op basis van recente klantinteracties en geef drie verbeterpunten om meer vertrouwen te wekken."
      },

      // ================================
      // MODULE 4
      // ================================
      {
        id: "4",
        title: "Klantwaarde & Strategieontwikkeling",
        theory: [
          "Niet elke klant verdient dezelfde aandacht — maar elke klant verdient relevantie. Door klanten te segmenteren op strategische waarde kun je focus aanbrengen in tijd, energie en groei.",
          "Een strategische accountmanager kijkt verder dan omzet. Je beoordeelt klanten op groeipotentieel, strategische fit en invloed binnen hun marktsegment.",
          "Een sterk accountplan is geen document, maar een levend instrument dat richting geeft aan jouw acties en prioriteiten. Het helpt je sturen op waarde in plaats van op volume.",
          "Strategisch klantbeheer draait om keuzes durven maken. Focus op de relaties waar wederzijds rendement het hoogst is — dát is duurzame groei."
        ],
        reflections: [
          "Welke klanten leveren de meeste waarde op lange termijn?",
          "Hoe kun jij jouw tijdsbesteding beter afstemmen op klantpotentieel?",
          "Wat zegt jouw huidige klantenportfolio over je strategische focus?"
        ],
        quiz: [
          {
            question: "Wat is het voordeel van klantsegmentatie?",
            options: [
              "Je kunt gerichter prioriteiten stellen en waarde leveren",
              "Je kunt sneller verkopen aan iedereen",
              "Je hoeft minder te luisteren naar klanten"
            ],
            correctAnswer: 0,
            feedback: [
              "✅ Precies — focus versterkt effectiviteit.",
              "❌ Onrealistisch — niet elke klant is even waardevol.",
              "❌ Dat ondermijnt juist het principe van partnerschap."
            ]
          }
        ],
        aiPrompt:
          "Segmenteer mijn klanten op omzetpotentieel en strategische waarde, en geef advies hoe ik mijn tijd het beste kan verdelen."
      },

      // ================================
      // MODULE 5
      // ================================
      {
        id: "5",
        title: "Relatiebeheer & Groei",
        theory: [
          "Relaties groeien niet vanzelf. Ze vragen om onderhoud, aandacht en intentie. In deze module leer je hoe je bestaande klanten kunt verdiepen door continu waarde toe te voegen.",
          "Cross- en upselling ontstaan niet door pushen, maar door relevantie. Wanneer je klant écht begrijpt dat jouw oplossing hun toekomst ondersteunt, volgt groei vanzelf.",
          "Relatiebeheer is het vermogen om aanwezig te blijven zonder opdringerig te zijn. De balans tussen geven en nemen bepaalt hoe sterk een relatie is.",
          "De sleutel ligt in nieuwsgierigheid — blijf leren, vragen en verrassen. Zo houd je de relatie levend en betekenisvol."
        ],
        reflections: [
          "Welke klant heeft volgens jou nog onbenut potentieel?",
          "Hoe kun jij proactiever kansen signaleren zonder te pushen?",
          "Wat betekent ‘geven’ voor jou in klantrelaties?"
        ],
        quiz: [
          {
            question: "Wat is de basis van duurzame klantgroei?",
            options: [
              "Prijsverlagingen en kortingen",
              "Betrouwbaarheid, nieuwsgierigheid en continue waarde",
              "Regelmatig contact zonder agenda"
            ],
            correctAnswer: 1,
            feedback: [
              "❌ Kortingen verlagen waardeperceptie.",
              "✅ Juist — langdurige groei komt voort uit vertrouwen en aandacht.",
              "⚠️ Contact is goed, maar zonder waarde blijft het leeg."
            ]
          }
        ],
        aiPrompt:
          "Analyseer mijn klantportfolio en geef drie suggesties voor waardevolle cross-sell of up-sell kansen."
      },

      // ================================
      // MODULE 6
      // ================================
      {
        id: "6",
        title: "Onderhandelen & Waardegedreven Resultaten",
        theory: [
          "Onderhandelen is geen strijd om gelijk, maar een zoektocht naar balans. Een sterke accountmanager weet wat hij waard is, maar ook wat de klant waardevol vindt.",
          "Goede onderhandelaars zoeken niet naar winst voor één partij, maar naar een uitkomst waar beide beter van worden — dat is duurzaam succes.",
          "Waardecreatie staat centraal: je onderhandelt niet over korting, maar over impact, continuïteit en samenwerking.",
          "Resultaatgerichtheid betekent: vasthouden aan principes, flexibel blijven in aanpak. Jij bewaakt de waarde, niet alleen de deal."
        ],
        reflections: [
          "Wat betekent een ‘goede deal’ voor jou én voor je klant?",
          "Hoe blijf jij trouw aan je waarde tijdens een moeilijke onderhandeling?",
          "Wat zijn jouw persoonlijke groeipunten als onderhandelaar?"
        ],
        quiz: [
          {
            question: "Wat is het doel van een effectieve onderhandeling?",
            options: [
              "Een compromis waarbij beide partijen waarde behouden",
              "Altijd je zin krijgen",
              "De andere partij overtuigen met prijsdruk"
            ],
            correctAnswer: 0,
            feedback: [
              "✅ Juist — win-win bouwt partnerschappen.",
              "❌ Dat breekt relaties af.",
              "❌ Prijsdruk vermindert vertrouwen."
            ]
          }
        ],
        aiPrompt:
          "Evalueer mijn laatste onderhandeling en geef feedback over hoe ik beter balans kan vinden tussen waarde, flexibiliteit en resultaat."
      }
    ]
  }
];
