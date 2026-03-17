type StrategicLandscapePoint = {
  label: string;
  x: number;
  y: number;
};

type StrategicLandscapeMapProps = {
  points: StrategicLandscapePoint[];
};

export default function StrategicLandscapeMap({ points }: StrategicLandscapeMapProps) {
  return (
    <section className="rounded-[16px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Strategisch speelveld</p>
          <h2 className="mt-2 text-[20px] font-semibold text-white">Analysepositie in het landschap</h2>
        </div>
      </div>
      <div className="relative mt-6 h-[240px] rounded-[14px] border border-white/[0.06] bg-[radial-gradient(circle_at_top,#1d2b3f,transparent_65%),rgba(10,14,22,0.8)]">
        {points.map((point) => (
          <div
            key={`${point.label}-${point.x}-${point.y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <div className="h-3 w-3 rounded-full bg-[#C9A854]" />
            <p className="mt-2 whitespace-nowrap text-[11px] text-slate-200">{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
