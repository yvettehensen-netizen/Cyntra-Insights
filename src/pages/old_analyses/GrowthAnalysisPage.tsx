import AIAnalysisPage from "../components/AIAnalysisPage";

export default function GrowthAnalysisPage() {
  const questions = [
    { name: "goal", label: "Wat is je groeidoel (kort en lang termijn)?" },
    { name: "sector", label: "In welke sector ben je actief?" },
    { name: "size", label: "Hoe groot is je organisatie?" },
    { name: "expansion", label: "Ben je actief in internationale markten?" },
  ];
  return (
    <AIAnalysisPage
      title="Growth Analysis"
      description="Ontvang een groeiplan op basis van McKinsey 7S, Porter en PESTEL."
      questions={questions}
      promptTopic="groeistrategie, McKinsey 7S, Porter’s Five Forces, PESTEL"
    />
  );
}
