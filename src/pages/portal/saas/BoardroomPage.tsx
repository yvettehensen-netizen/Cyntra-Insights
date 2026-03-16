import { useMemo, useState } from "react";
import { BoardroomDocumentGenerator, type BoardroomDocuments } from "@/aurelius/boardroom";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";

function downloadText(filename: string, content: string) {
  const href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

export default function BoardroomPage() {
  const generator = useMemo(() => new BoardroomDocumentGenerator(), []);
  const [input, setInput] = useState(
    "Beschrijf de strategische context, kernspanning, risico's en gewenste besluitrichting."
  );
  const [sector, setSector] = useState("Zorg/GGZ");
  const [dominantProblem, setDominantProblem] = useState(
    "Parallelle groei- en consolidatieambities verhogen margedruk en uitvoeringsrisico."
  );
  const [output, setOutput] = useState<BoardroomDocuments | null>(null);

  function generate() {
    const docs = generator.generate({
      context_text: input,
      sector,
      dominant_problem: dominantProblem,
      mechanisms: ["margedruk", "capaciteitsdruk", "governance-frictie"],
    });
    setOutput(docs);
  }

  return (
    <PageShell title="Boardroom" subtitle="Boardroom Mode voor beslisnota, strategisch rapport, executive samenvatting en boardpresentatie.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Documenten" value={output ? 3 : 0} hint="Beslisnota, samenvatting en slides uit één bestuurscontext." />
        <StatCard label="Sector" value={sector} hint="Context waarop de boardroom-output wordt afgestemd." tone="blue" />
        <StatCard label="Status" value={output ? "Gegenereerd" : "Gereed"} hint="Direct bruikbaar voor memo, deck en besluitvorming." tone="green" />
      </div>
      <Panel title="Generator instellingen">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-gray-200">
            Sector
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={sector} onChange={(e) => setSector(e.target.value)} />
          </label>
          <label className="text-sm text-gray-200">
            Dominante spanning
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={dominantProblem} onChange={(e) => setDominantProblem(e.target.value)} />
          </label>
        </div>
        <label className="mt-3 block text-sm text-gray-200">
          Strategische context
          <textarea className="mt-1 min-h-[140px] w-full rounded-lg border border-white/20 bg-black/20 p-2" value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <div className="mt-3">
          <button className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black" onClick={generate}>
            Boarddocumenten genereren
          </button>
        </div>
      </Panel>

      <Panel title="Executive samenvatting">
        {!output ? (
          <EmptyState text="Nog geen executive samenvatting gegenereerd." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <SurfaceCard title="Besluitvraag" eyebrow="Executive samenvatting">
              {output.executive_samenvatting.besluitvraag}
            </SurfaceCard>
            <SurfaceCard title="Kernanalyse">
              {output.executive_samenvatting.kernanalyse}
            </SurfaceCard>
            <SurfaceCard title="Aanbevolen strategie">
              {output.executive_samenvatting.aanbevolen_strategie}
            </SurfaceCard>
            <SurfaceCard title="Belangrijkste risico">
              {output.executive_samenvatting.belangrijkste_risico}
            </SurfaceCard>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Beslisnota generator">
          {!output ? (
            <EmptyState text="Nog geen beslisnota gegenereerd." />
          ) : (
            <>
              <pre className="max-h-[320px] overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-gray-200">{output.beslisnota.document_text}</pre>
              <button className="mt-3 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => downloadText("beslisnota.txt", output.beslisnota.document_text)}>
                Download beslisnota
              </button>
            </>
          )}
        </Panel>

        <Panel title="Board presentatie generator">
          {!output ? (
            <EmptyState text="Nog geen slides gegenereerd." />
          ) : (
            <>
              <div className="space-y-3">
                {output.board_slides.map((slide) => (
                  <article key={slide.slide_no} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <h3 className="text-sm font-semibold text-white">{slide.slide_no}. {slide.title}</h3>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-gray-200">
                      {slide.bullets.map((line, idx) => <li key={`${slide.slide_no}-${idx}`}>{line}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
              <button className="mt-3 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => downloadText("board-slides.txt", output.board_slides.map((s) => `${s.slide_no}. ${s.title}\n- ${s.bullets.join("\n- ")}`).join("\n\n"))}>
                Download slides
              </button>
            </>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
