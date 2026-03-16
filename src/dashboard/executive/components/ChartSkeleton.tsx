interface ChartSkeletonProps {
  heightClassName?: string;
}

export default function ChartSkeleton({ heightClassName = "h-[300px]" }: ChartSkeletonProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#0f141c] p-5 ${heightClassName}`} aria-busy="true" aria-live="polite">
      <div className="mb-4 h-4 w-44 animate-pulse rounded bg-white/10" />
      <div className="h-full animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
