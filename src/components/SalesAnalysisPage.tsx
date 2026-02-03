import React from "react";
import AIAnalysisPage from "../aurelius/components/AIAnalysisPage";

export default function SalesAnalysisPage() {
  return (
    <AIAnalysisPage
      title="AI Sales Analysis"
      description="Krijg inzicht in conversies, klantgedrag en verkoopkansen. Deze analyse helpt je salesprocessen datagedreven te verbeteren."
      promptTopic="salesoptimalisatie en klantanalyse"
      questions={[
        { name: "doelgroep", label: "Wat is je belangrijkste doelgroep?" },
        { name: "conversie", label: "Wat is je huidige conversieratio (%)?" },
        { name: "uitdaging", label: "Wat is je grootste uitdaging binnen sales?" },
      ]}
    />
  );
}
