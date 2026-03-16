export type StrategicModelInput = {
  sector: string;
  verdienmodel: string;
  contextText: string;
};

export type StrategicModelOutput = {
  strategic_model: string;
  model_rationale: string;
};

function hasAny(source: string, terms: string[]): boolean {
  const low = source.toLowerCase();
  return terms.some((term) => low.includes(term.toLowerCase()));
}

export class StrategicModelEngine {
  readonly name = "Strategic Model Engine";

  identify(input: StrategicModelInput): StrategicModelOutput {
    const source = [input.sector, input.verdienmodel, input.contextText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (hasAny(source, ["contract", "verzekeraar", "declaratie", "plafond"])) {
      return {
        strategic_model: "contractgedreven model",
        model_rationale: "Opbrengst en schaal worden primair bepaald door contractvoorwaarden en plafondruimte.",
      };
    }
    if (hasAny(source, ["abonnement", "subscription", "retainer", "licentie"])) {
      return {
        strategic_model: "platform-/subscriptionmodel",
        model_rationale: "Waardecreatie leunt op terugkerende inkomsten en retentie in plaats van volume per transactie.",
      };
    }
    if (hasAny(source, ["premium", "kwaliteit", "specialistisch", "hoogwaardig"])) {
      return {
        strategic_model: "premium-model",
        model_rationale: "Differentiatie op kwaliteit en expertise is leidend voor marge en positionering.",
      };
    }
    return {
      strategic_model: "volume-model",
      model_rationale: "Economische prestaties hangen vooral af van doorstroom, benutting en schaalconsistentie.",
    };
  }
}
