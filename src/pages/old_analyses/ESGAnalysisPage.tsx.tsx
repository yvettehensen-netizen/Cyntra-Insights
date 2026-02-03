import AIAnalysisPage from "../components/AIAnalysisPage";

export default function ESGAnalysisPage() {
  const questions = [
    { name: "environment", label: "Wat doe je op milieugebied (energie, CO₂)?" },
    { name: "social", label: "Hoe draag je bij aan sociale impact?" },
    { name: "governance", label: "Hoe borg je goed bestuur en transparantie?" },
  ];
  return (
    <AIAnalysisPage
      title="ESG Analysis"
      description="Beoordeel je prestaties op het gebied van duurzaamheid en governance."
      questions={questions}
      promptTopic="Environmental, Social & Governance analyse"
    />
  );
}
