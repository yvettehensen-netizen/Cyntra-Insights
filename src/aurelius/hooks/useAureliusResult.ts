import { useEffect, useState } from "react";
import { AureliusResult } from "@/aurelius/types/aureliusResult";

export function useAureliusResult(resultId: string | undefined) {
  const [data, setData] = useState<AureliusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) return;

    async function load() {
      try {
        // 🔒 Vervang dit straks door echte API
        const mock: AureliusResult = {
          id: resultId,
          analysis_id: "strategy",
          executive_truth:
            "De organisatie vermijdt een keuze die binnen 12 maanden onhoudbaar wordt.",
          tensions: [
            "Groei vs. bestuurbaarheid",
            "Consensus vs. daadkracht",
            "Ambitie vs. capaciteit",
          ],
          forced_choices: {
            stop: ["Initiatief X", "Structuur Y", "Activiteit Z"],
            choose: [
              "Focus op kernmarkt",
              "Heldere eigenaarschap",
              "Radicale prioritering",
            ],
            cost_of_inaction:
              "Complexiteit groeit sneller dan waardecreatie — met onvermijdelijke erosie van marge en talent.",
          },
          risk_of_inaction:
            "Binnen 12–18 maanden verlies van strategische focus, key talent en financiële manoeuvreerruimte.",
          boardroom_summary: [
            "Keuzes worden structureel uitgesteld onder het mom van consensus",
            "Groei vergroot complexiteit in plaats van waarde",
            "Besluitvorming mist eigenaarschap en consequenties",
            "Financiële risico’s stapelen zich op zonder correctie",
            "Verandering faalt op gedrag, niet op intentie",
            "Actie vereist binnen één kwartaal — anders is herstel kostbaarder",
          ],
        };

        setData(mock);
      } catch {
        setError("Resultaat kon niet worden geladen.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [resultId]);

  return { data, loading, error };
}
