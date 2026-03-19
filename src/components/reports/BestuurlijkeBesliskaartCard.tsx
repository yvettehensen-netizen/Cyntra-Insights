import BoardDecisionCard from "./BoardDecisionCard";
import type { BoardroomExecutiveDecisionCardDocument } from "@/types/BoardroomDocument";

type BestuurlijkeBesliskaartCardProps = {
  card?: BoardroomExecutiveDecisionCardDocument;
  onCopyDecision?: () => void;
};

export default function BestuurlijkeBesliskaartCard({
  card,
  onCopyDecision,
}: BestuurlijkeBesliskaartCardProps) {
  if (!card) return null;
  return <BoardDecisionCard card={card} onCopyDecision={onCopyDecision} />;
}
