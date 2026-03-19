import DecisionCockpit from "./DecisionCockpit";
import { assertCanonicalBoardroomDocument } from "@/engine/canonicalReportGuard";
import type { BoardroomDocument } from "@/types/BoardroomDocument";

type BoardroomViewProps = {
  boardroomDocument: BoardroomDocument;
  compact?: boolean;
  onCopyDecision?: () => void;
};

export default function BoardroomView({
  boardroomDocument,
  compact = false,
  onCopyDecision,
}: BoardroomViewProps) {
  assertCanonicalBoardroomDocument(boardroomDocument);

  return (
    <DecisionCockpit
      boardroomDocument={boardroomDocument}
      compact={compact}
      titleLabel="Decision cockpit"
      onCopyDecision={onCopyDecision}
    />
  );
}
