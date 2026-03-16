export type ResistancePredictorInput = {
  orgDynamicsText: string;
  boardroomText: string;
  decisionPressureText: string;
};

export type ResistancePoint = {
  point: string;
  why: string;
  form: "OPEN" | "STIL" | "VERTRAGING" | "SABOTAGE";
  risk: string;
};

function hasAny(text: string, terms: string[]): boolean {
  const source = String(text ?? "").toLowerCase();
  return terms.some((t) => source.includes(t.toLowerCase()));
}

export function predictResistance(input: ResistancePredictorInput): ResistancePoint[] {
  const source = `${input.orgDynamicsText}\n${input.boardroomText}\n${input.decisionPressureText}`;

  const points: ResistancePoint[] = [
    {
      point: "Verlies van autonomie bij centrale prioritering",
      why: "Lokale beslisruimte krimpt door centralisatie van mandaat en stopregels.",
      form: "STIL",
      risk: "Passieve naleving met vertraagde uitvoering en informatieachterstand.",
    },
    {
      point: "Verhoging van transparantie en normdiscipline",
      why: "Maandelijkse opvolging maakt prestaties en afwijkingen expliciet zichtbaar.",
      form: hasAny(source, ["conflict", "frictie"]) ? "OPEN" : "VERTRAGING",
      risk: "Defensief gedrag of uitstel in rapportage, waardoor correcties te laat komen.",
    },
    {
      point: "Machtsverschuiving en reputatierisico",
      why: "Besluitmonopolie verschuift naar centrale governance en beïnvloedt informele macht.",
      form: hasAny(source, ["sabotage", "stil veto"]) ? "SABOTAGE" : "STIL",
      risk: "Bypass-routes en uitzonderingsgedrag ondermijnen interventie-effect.",
    },
  ];

  return points;
}
