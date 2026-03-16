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
          executive_summary:
            "De organisatie vermijdt een keuze die binnen 12 maanden onhoudbaar wordt.",
          board_memo: [
            "Bestuurlijke hypothese",
            "De organisatie stelt kernbesluiten uit onder het mom van consensus.",
            "",
            "Kernconflict (A/B keuze)",
            "Groei vs. bestuurbaarheid, consensus vs. daadkracht, ambitie vs. capaciteit.",
            "",
            "Besluitvoorstel",
            "Aanbevolen optie: B",
          ].join("\n"),
          strategic_conflict:
            "Groei versus bestuurbaarheid: meer initiatieven vergroten complexiteit sneller dan executiekracht.",
          recommended_option: "B",
          interventions: [
            { title: "Stop laag-rendabele initiatieven", owner: "MT" },
            { title: "Maak eigenaarschap expliciet per prioriteit", owner: "CEO" },
            { title: "Beperk besluitvorming tot drie strategische keuzes per kwartaal", owner: "Board" },
          ],
          insights: [
            "Keuzes worden structureel uitgesteld onder het mom van consensus",
            "Groei vergroot complexiteit in plaats van waarde",
            "Besluitvorming mist eigenaarschap en consequenties",
            "Financiële risico’s stapelen zich op zonder correctie",
            "Verandering faalt op gedrag, niet op intentie",
            "Actie vereist binnen één kwartaal — anders is herstel kostbaarder",
          ],
          risks: [
            "Verlies van strategische focus",
            "Erosie van marge",
            "Verlies van sleutelmedewerkers",
          ],
          opportunities: [
            "Radicale prioritering",
            "Heldere eigenaarschap",
            "Focus op kernmarkt",
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
