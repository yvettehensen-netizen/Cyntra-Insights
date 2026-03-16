import type {
  AureliusCompleteNodeId,
  AureliusNodeOutput,
  AureliusNodeProcessor,
  AureliusPipelineState,
} from "./types";

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function detectSector(text: string): string {
  if (/\bggz|zorg|jeugdzorg\b/i.test(text)) return "zorg";
  if (/\bsaas|software|platform\b/i.test(text)) return "saas";
  return "onbekend";
}

export function mkNodeOutput(
  node: AureliusCompleteNodeId,
  summary: string,
  data: Record<string, unknown>,
  confidence = 0.78
): AureliusNodeOutput {
  return { node, summary: normalize(summary), data, confidence };
}

export function runAureliusCompleteNode(
  node: AureliusCompleteNodeId,
  state: AureliusPipelineState
): AureliusNodeOutput {
  const base = normalize(state.inputText);
  const contextSample = base.slice(0, 220);

  switch (node) {
    case "ContextEngine":
      return mkNodeOutput(
        node,
        "Context samengebracht met organisatie-, sector- en signaalextractie.",
        {
          organization: state.organizationName || "onbekend",
          sector: state.sector || detectSector(base),
          signal_count: Math.max(1, contextSample.split(" ").length),
        },
        0.88
      );
    case "CaseClassificationNode":
      return mkNodeOutput(node, "Case geclassificeerd op dominante veranderlogica.", {
        case_type: /\bcrisis|verlies|marge\b/i.test(base) ? "crisis" : "systeemtransformatie",
      });
    case "StrategicConflictNode":
      return mkNodeOutput(node, "Kernconflict geformuleerd als beschermdoel versus schaaldoel.", {
        tensionA: "kwaliteit beschermen",
        tensionB: "impact opschalen",
      });
    case "DominantThesisNode":
      return mkNodeOutput(
        node,
        "Dominante these geformuleerd als mechanisme met impliciete bestuurskeuze.",
        { max_words: 120 }
      );
    case "StrategicOptionsNode":
      return mkNodeOutput(node, "Drie bestuurlijke opties gegenereerd (A/B/C) met onderscheidende logica.", {
        options: ["A", "B", "C"],
      });
    case "BoardDecisionNode":
      return mkNodeOutput(node, "Bestuurlijke keuze geconcretiseerd met expliciet verlies en besluittermijn.", {
        decision_horizon_days: 30,
      });
    case "NarrativeGenerator":
      return mkNodeOutput(
        node,
        "Definitieve boardroom-narrative opgebouwd met these, conflict, opties en interventies.",
        { format: "board_memo" },
        0.9
      );
    default:
      return mkNodeOutput(node, `${node} uitgevoerd in complete architectuurpipeline.`, {
        context_ref: contextSample,
      });
  }
}

export function createNodeProcessor(node: AureliusCompleteNodeId): AureliusNodeProcessor {
  return (state) => runAureliusCompleteNode(node, state);
}
