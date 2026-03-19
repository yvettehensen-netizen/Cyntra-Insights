import { reportViewStyles } from "./reportViewStyles";

type DecisionBlockProps = {
  headline: string;
  support?: string;
  dark?: boolean;
};

export default function DecisionBlock({ headline, support, dark = false }: DecisionBlockProps) {
  return (
    <div className="space-y-0">
      <p className={dark ? reportViewStyles.board.decisionHeadline : reportViewStyles.board.decisionHeadlineLight}>{headline}</p>
      {support ? <span className="sr-only">{support}</span> : null}
    </div>
  );
}
