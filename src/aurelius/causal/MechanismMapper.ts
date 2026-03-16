import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";

export type MappedMechanism = {
  hefboom: StrategicLeverInsight["lever"];
  mechanisme: string;
  operationeelEffect: string;
  bestuurlijkeImplicatie: string;
};

export function mapLeverMechanism(input: StrategicLeverInsight): MappedMechanism {
  const lever = input.lever;

  const operationalEffect =
    lever === "netwerkstrategieën"
      ? "Capaciteit groeit via partners in plaats van extra interne FTE."
      : lever === "capaciteitsbenutting"
        ? "Doorstroom verbetert en wachtdruk daalt bij gelijkblijvende capaciteit."
        : lever === "governance"
          ? "Besluitvertraging daalt en prioriteiten worden sneller uitvoerbaar."
          : lever === "data-infrastructuur"
            ? "Afwijkingen worden eerder zichtbaar en correcties volgen sneller."
            : lever === "prijsstrategie"
              ? "Commerciële keuzes worden selectiever waardoor niet-rendabele vraag afneemt."
              : "Operationele uitvoering sluit beter aan op het dominante schaalmechanisme.";

  return {
    hefboom: input.lever,
    mechanisme: input.mechanism,
    operationeelEffect: operationalEffect,
    bestuurlijkeImplicatie: input.boardImplication,
  };
}
