export type StrategicOption = {
  id: "A" | "B" | "C";
  title: string;
  focus: string;
  advantages: string[];
  disadvantages: string[];
  strategicRisk: string;
};

export type StrategicOptionGeneratorInput = {
  tension: string[];
};

export type StrategicOptionGeneratorResult = {
  options: StrategicOption[];
  block: string;
};

function optionToBlock(option: StrategicOption): string {
  return [
    `Optie ${option.id} – ${option.title}`,
    `focus: ${option.focus}`,
    `voordelen: ${option.advantages.join("; ")}`,
    `nadelen: ${option.disadvantages.join("; ")}`,
    `strategisch risico: ${option.strategicRisk}`,
  ].join("\n");
}

export function runStrategicOptionGenerator(
  input: StrategicOptionGeneratorInput
): StrategicOptionGeneratorResult {
  const hasFinancialTension = input.tension.some((item) => /financ/i.test(item));
  const hasYouthPositioningTension = input.tension.some((item) =>
    /(ambulante positionering|specialisatie|consortium|triage|contractsturing)/i.test(item)
  );

  if (hasYouthPositioningTension) {
    const options: StrategicOption[] = [
      {
        id: "A",
        title: "Brede ambulante specialist blijven",
        focus:
          "Behoud brede ambulante positionering, bescherm kerncapaciteit en beperk verbreding tot wat binnen consortium-, contract- en kwaliteitsdiscipline past.",
        advantages: [
          "sluit aan op bestaande positionering",
          "houdt bestuurlijke complexiteit beheersbaar",
          "beschermt teamstabiliteit en zorgkwaliteit",
        ],
        disadvantages: ["minder snelle verbreding", "beperkte ruimte voor nicheprofilering buiten de kern"],
        strategicRisk: "te brede positionering blijft kwetsbaar als contractruimte en triage blijvend vernauwen",
      },
      {
        id: "B",
        title: "Selectieve specialisatie / niche kiezen",
        focus:
          "Versmal het aanbod naar een scherper specialistisch profiel om capaciteit, kwaliteit en contractonderhandeling te concentreren.",
        advantages: ["helderder profiel", "meer focus in teams", "minder portfolio-complexiteit"],
        disadvantages: ["verlies van breedte in zorgaanbod", "hogere afhankelijkheid van beperkt vraagsegment"],
        strategicRisk: "te snelle versmalling kan regionale relevantie en instroombasis ondergraven",
      },
      {
        id: "C",
        title: "Consortiumstrategie verdiepen",
        focus:
          "Vergroot invloed via sterkere regionale samenwerking, scherpere triage-afspraken en explicietere rol in consortiumsturing.",
        advantages: ["betere aansluiting op instroommechaniek", "meer invloed op regionale toegang", "sterkere bestuurlijke verankering"],
        disadvantages: [
          "meer afhankelijkheid van partners en gemeenten",
          "langzamere autonome koerswijziging",
        ],
        strategicRisk: "governancecomplexiteit stijgt als rolverdeling en mandaat niet expliciet worden vastgelegd",
      },
    ];

    return {
      options,
      block: ["STRATEGISCHE OPTIES", ...options.map(optionToBlock)].join("\n\n"),
    };
  }

  const options: StrategicOption[] = [
    {
      id: "A",
      title: "Consolidatie",
      focus: "Kernzorg stabiliseren, margeherstel prioriteren, verbreding tijdelijk begrenzen.",
      advantages: ["hogere voorspelbaarheid", "sneller margeherstel", "lagere bestuurlijke ruis"],
      disadvantages: ["tragere volumegroei", "tijdelijk minder innovatie buiten de kern"],
      strategicRisk: "verlies van marktmomentum buiten kernactiviteiten",
    },
    {
      id: "B",
      title: "Parallel model",
      focus: "Kern consolideren en tegelijk beperkt verbreden met harde poortcriteria.",
      advantages: ["behoud van strategische opties", "gebalanceerde groei", "betere leerlus"],
      disadvantages: ["hogere sturingscomplexiteit", "risico op prioriteitsconflict"],
      strategicRisk: "scope-creep bij onvoldoende stopregels en mandaatdiscipline",
    },
    {
      id: "C",
      title: "Verbreding",
      focus: "Versneld opschalen van nieuwe initiatieven naast de GGZ-kern.",
      advantages: ["hogere potentiële omzetdiversificatie", "strategische zichtbaarheid"],
      disadvantages: [
        hasFinancialTension
          ? "hogere kans op margedruk in de kern"
          : "hogere implementatiedruk in management",
        "meer afhankelijkheid van schaarse capaciteit",
      ],
      strategicRisk: "kapitaal- en aandachtstekort bij onvoldoende contract- en capaciteitsbasis",
    },
  ];

  const block = [
    "STRATEGISCHE OPTIES",
    ...options.map(optionToBlock),
  ].join("\n\n");

  return {
    options,
    block,
  };
}
