import type { ReactNode } from "react";
import { reportViewStyles } from "./reportViewStyles";

type ReportSectionProps = {
  id?: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
};

export default function ReportSection({ id, eyebrow, title, children, dark = false }: ReportSectionProps) {
  return (
    <section
      id={id}
      className={dark ? reportViewStyles.board.sectionDark : reportViewStyles.board.section}
    >
      <div className="space-y-4">
        <p className={dark ? reportViewStyles.board.eyebrowDark : reportViewStyles.board.eyebrow}>
          {eyebrow}
        </p>
        <h2 className={dark ? reportViewStyles.board.sectionTitleDark : reportViewStyles.board.sectionTitle}>
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
