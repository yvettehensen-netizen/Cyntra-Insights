import AIAnalysisPage from "./AIAnalysisPage";

export default function ProcessAnalysisPage() {
  return (
    <AIAnalysisPage
      title="Process Analysis"
      description="Analyseer je operationele processen en ontdek waar efficiëntie te winnen valt."
      analysisType="process"
      questions={[
        {
          name: "mainProcess",
          label: "Wat is het belangrijkste bedrijfsproces?",
        },
        {
          name: "painPoints",
          label: "Waar ontstaan de grootste knelpunten?",
        },
        {
          name: "automation",
          label: "Welke processen zijn geautomatiseerd?",
        },
        {
          name: "tools",
          label: "Welke tools of software gebruik je?",
        },
      ]}
    />
  );
}
