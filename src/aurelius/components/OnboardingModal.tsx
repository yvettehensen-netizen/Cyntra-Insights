export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="max-w-lg p-8 bg-[#111] border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Welkom bij Aurelius</h2>

        <p className="text-gray-400 mb-6">
          Aurelius ondersteunt strategische besluitvorming.
          Analyses zijn indicatief en bedoeld als input voor
          menselijke afwegingen.
        </p>

        <ul className="text-sm text-gray-400 space-y-2 mb-6">
          <li>✔ Geen automatische besluiten</li>
          <li>✔ Geen hergebruik van klantdata</li>
          <li>✔ Volledige transparantie</li>
        </ul>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#D4AF37] text-black rounded-xl font-semibold"
        >
          Begrepen, start analyse
        </button>
      </div>
    </div>
  );
}
