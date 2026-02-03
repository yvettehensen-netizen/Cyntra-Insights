// src/pages/RegistrationPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  ArrowRight,
  Shield,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function RegistrationPage() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !company) return;

    setLoading(true);

    // ⬇️ Placeholder voor Supabase / backend / CRM
    // later: insert into access_requests
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <>
      <Helmet>
        <title>Toegang aanvragen | Cyntra Insights</title>
        <meta
          name="description"
          content="Vraag exclusieve toegang aan tot de Aurelius analyseomgeving voor directies, boards en strategische adviseurs."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-br from-[#0A090A] via-[#120B10] to-[#0A090A] text-white flex items-center justify-center px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-64 -right-64 w-[1200px] h-[1200px] bg-[#8B1538]/20 rounded-full blur-[350px]" />
          <div className="absolute -bottom-64 -left-64 w-[1200px] h-[1200px] bg-[#D4AF37]/15 rounded-full blur-[350px]" />
        </div>

        <div className="relative z-10 max-w-2xl w-full">
          <div className="relative bg-black/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-16 shadow-[0_60px_140px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/8 via-transparent to-[#8B1538]/5 rounded-3xl" />

            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-12 rounded-3xl bg-[#D4AF37]/20 flex items-center justify-center shadow-2xl">
                <Lock size={48} className="text-[#D4AF37]" />
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Toegang aanvragen<br />
                <span className="text-[#D4AF37] drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]">
                  Aurelius Portal
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-16 max-w-lg mx-auto leading-relaxed">
                Cyntra is een besloten strategische omgeving.<br />
                Toegang wordt handmatig beoordeeld op directie- en boardniveau.
              </p>

              {/* Trust */}
              <div className="flex justify-center gap-16 mb-16 text-gray-400">
                <TrustItem icon={<Shield size={32} />} label="Volledig privé" />
                <TrustItem icon={<Zap size={32} />} label="EU-gehost" />
                <TrustItem icon={<Users size={32} />} label="Selectief" />
              </div>

              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <Field
                    label="Organisatie"
                    value={company}
                    onChange={setCompany}
                    placeholder="Bijv. Holding B.V."
                  />
                  <Field
                    label="Zakelijk e-mailadres"
                    value={email}
                    onChange={setEmail}
                    placeholder="naam@bedrijf.nl"
                    type="email"
                  />

                  <button
                    type="submit"
                    disabled={loading || !email || !company}
                    className="group relative w-full py-7 rounded-3xl bg-[#D4AF37] text-black font-bold text-2xl shadow-3xl hover:shadow-[#D4AF37]/70 hover:scale-[1.02] disabled:opacity-60 transition-all"
                  >
                    {loading ? "Verwerken…" : "Aanvraag indienen"}
                  </button>
                </form>
              ) : (
                <div className="py-12">
                  <CheckCircle2 size={80} className="text-emerald-400 mx-auto mb-8" />
                  <h2 className="text-3xl font-bold mb-6">
                    Aanvraag ontvangen
                  </h2>
                  <p className="text-xl text-gray-300 mb-12">
                    Je aanvraag wordt persoonlijk beoordeeld.<br />
                    Je ontvangt binnen 48 uur bericht.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-4 px-12 py-6 rounded-2xl border border-white/30 text-white text-xl hover:bg-white/10 transition"
                  >
                    Terug naar homepage
                    <ArrowRight size={24} />
                  </Link>
                </div>
              )}

              <div className="mt-16 text-sm text-gray-500">
                End-to-end versleuteld • Geen AI-training op klantdata
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      {icon}
      <p className="mt-3 text-sm font-medium">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-base font-medium text-gray-300 mb-4 text-left">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className="w-full px-10 py-6 rounded-3xl bg-black/60 border border-white/30 text-lg placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/20 transition shadow-inner"
      />
    </div>
  );
}
