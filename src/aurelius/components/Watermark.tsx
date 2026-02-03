interface WatermarkProps {
  text?: string;
  logoUrl?: string;
  risk?: "LOW" | "MODERATE" | "HIGH";
}

export default function Watermark({
  text = "STRICTLY CONFIDENTIAL",
  logoUrl,
  risk = "MODERATE",
}: WatermarkProps) {
  const opacity =
    risk === "HIGH"
      ? 0.09
      : risk === "MODERATE"
      ? 0.05
      : 0.03;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none">
      <div
        className="absolute -inset-[50%] flex flex-wrap gap-x-32 gap-y-24 rotate-[-30deg]"
        style={{ opacity }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center font-bold text-white whitespace-nowrap"
            style={{ fontSize: "4.5rem" }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Watermark"
                className="h-16 opacity-80"
              />
            ) : (
              text
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
