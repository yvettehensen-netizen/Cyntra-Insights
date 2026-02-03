import AIAnalysisPage from "../aurelius/components/AIAnalysisPage";

export default function DigitalMaturityAnalysisPage() {
  const questions = [
    { name: "systems", label: "Welke digitale systemen gebruik je?" },
    { name: "automation", label: "In hoeverre zijn processen geautomatiseerd?" },
    { name: "dataUse", label: "Hoe gebruik je data in besluitvorming?" },
    { name: "aiIntegration", label: "Wordt AI of machine learning toegepast?" },
  ];
  return (
    <AIAnalysisPage
      title="Digital Maturity Analysis"
      description="Beoordeel de digitale volwassenheid van je organisatie."
      questions={questions}
      promptTopic="digitale transformatie en technologieadoptie"
    />
  );
}
