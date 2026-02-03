type Props = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function KpiCard({ title, value, subtitle }: Props) {
  return (
    <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
      <h3 className="text-sm text-gray-400">{title}</h3>
      <div className="text-4xl font-bold text-[#D6B48E] mt-2">
        {value}
      </div>
      {subtitle && (
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
}
