// src/pages/portal/SettingsPage.tsx
import { useEffect, useState } from "react";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
} from "lucide-react";

interface OrganizationSettings {
  name: string;
  sector: string;
  size: string;
  contextCompleteness: number; // %
  apiReady: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: "",
    sector: "",
    size: "",
    contextCompleteness: 0,
    apiReady: false,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // MOCK – later Supabase
    setSettings({
      name: "Acme B.V.",
      sector: "Technologie / Software",
      size: "51–200 medewerkers",
      contextCompleteness: 82,
      apiReady: true,
    });
  }, []);

  const saveSettings = () => {
    // TODO: save to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl space-y-20">
      {/* Header */}
      <header>
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          Organisatie & Governance
        </h1>
        <p className="text-xl text-gray-400 max-w-4xl leading-relaxed">
          Deze gegevens bepalen hoe scherp, betrouwbaar en bestuurbaar
          de Aurelius-analyses zijn.  
          Onvolledige context leidt tot zachtere conclusies.
        </p>
      </header>

      {/* Organisatiecontext */}
      <section className="grid lg:grid-cols-2 gap-16">
        {/* Context */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold">
            Organisatiecontext
          </h2>

          <Field
            label="Organisatienaam"
            value={settings.name}
            onChange={(v) => setSettings({ ...settings, name: v })}
            placeholder="Bijv. Acme B.V."
          />

          <Field
            label="Sector / markt"
            value={settings.sector}
            onChange={(v) => setSettings({ ...settings, sector: v })}
            placeholder="Bijv. Software, Industrie, Zorg"
          />

          <Select
            label="Organisatiegrootte"
            value={settings.size}
            onChange={(v) => setSettings({ ...settings, size: v })}
            options={[
              "1–10 medewerkers",
              "11–50 medewerkers",
              "51–200 medewerkers",
              "201–500 medewerkers",
              "500+ medewerkers",
            ]}
          />
        </div>

        {/* Analysebetrouwbaarheid */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
            <Shield size={26} className="text-[#D4AF37]" />
            Analysebetrouwbaarheid
          </h3>

          <div className="space-y-10">
            {/* Context score */}
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Contextvolledigheid
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37]"
                    style={{ width: `${settings.contextCompleteness}%` }}
                  />
                </div>
                <span className="font-bold text-[#D4AF37]">
                  {settings.contextCompleteness}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Hoe vollediger de context, hoe scherper de conclusies.
              </p>
            </div>

            {/* API readiness */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Aurelius Engine status</p>
                <p className="text-sm text-gray-400 mt-1">
                  Beslismachine operationeel
                </p>
              </div>
              {settings.apiReady ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={20} />
                  Actief
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle size={20} />
                  Beperkt
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Technische configuratie is afgeschermd en niet zichtbaar
              voor gebruikers.
            </p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="text-center">
        <button
          onClick={saveSettings}
          className="group inline-flex items-center gap-6 px-20 py-7 rounded-2xl bg-[#D4AF37] text-black font-bold text-2xl shadow-2xl hover:shadow-[#D4AF37]/60 hover:scale-105 transition"
        >
          Wijzigingen vastleggen
          <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" />
        </button>

        {saved && (
          <p className="mt-6 text-emerald-400 flex items-center justify-center gap-3">
            <CheckCircle2 size={20} />
            Context succesvol opgeslagen
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-12 border-t border-white/10 text-center text-sm text-gray-500 flex items-center justify-center gap-3">
        <Lock size={16} />
        End-to-end beveiligd • Geen dataretentie • Boardroom-grade governance
      </footer>
    </div>
  );
}

/* ===== Helpers ===== */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-base text-gray-300 mb-3">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-8 py-5 rounded-2xl bg-black/40 border border-white/20 text-lg focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/20"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-base text-gray-300 mb-3">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-8 py-5 rounded-2xl bg-black/40 border border-white/20 text-lg focus:outline-none focus:border-[#D4AF37]"
      >
        <option value="">Selecteer</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
