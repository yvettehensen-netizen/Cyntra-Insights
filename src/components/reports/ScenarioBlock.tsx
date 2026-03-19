import { reportViewStyles } from "./reportViewStyles";

type ScenarioBlockProps = {
  code: string;
  title: string;
  explanation: string;
  dark?: boolean;
};

export default function ScenarioBlock({ code, title, explanation, dark = false }: ScenarioBlockProps) {
  return (
    <div className="max-w-[600px] space-y-3">
      <p className={dark ? reportViewStyles.board.rowTitleDark : reportViewStyles.board.rowTitle}>{`${code} — ${title}`}</p>
      <p className={dark ? reportViewStyles.board.bodyDark : reportViewStyles.board.body}>{explanation}</p>
    </div>
  );
}
