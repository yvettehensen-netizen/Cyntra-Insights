// src/pages/portal/InstellingenPage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Save,
  Lock,
  Bell,
} from "lucide-react";

interface ProfileState {
  email: string;
  full_name: string;
  company_name: string;
  phone: string;
  address: string;
}

export default function InstellingenPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({
    email: "",
    full_name: "",
    company_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setProfile((p) => ({ ...p, email: user.email ?? "" }));

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile((p) => ({
        ...p,
        full_name: data.full_name ?? "",
        company_name: data.company_name ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
      }));
    }
  }

  async function handleSave() {
    setLoading(true);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.full_name,
      company_name: profile.company_name,
      phone: profile.phone,
      address: profile.address,
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-white">Instellingen</h1>
        <p className="text-gray-400 mt-2">
          Beheer je account en voorkeuren
        </p>
      </header>

      {/* PROFIEL */}
      <section className="bg-[#111] border border-white/10 rounded-2xl p-8 mb-8">
        <SectionTitle icon={User} title="Profiel" />

        <Field label="Email">
          <Mail className="icon" />
          <input disabled value={profile.email} className="input disabled" />
        </Field>

        <Field label="Volledige naam">
          <User className="icon" />
          <input
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            className="input"
          />
        </Field>

        <Field label="Bedrijfsnaam">
          <Building className="icon" />
          <input
            value={profile.company_name}
            onChange={(e) =>
              setProfile({ ...profile, company_name: e.target.value })
            }
            className="input"
          />
        </Field>

        <Field label="Telefoon">
          <Phone className="icon" />
          <input
            value={profile.phone}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
            className="input"
          />
        </Field>

        <Field label="Adres">
          <MapPin className="icon textarea-icon" />
          <textarea
            rows={3}
            value={profile.address}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
            className="textarea"
          />
        </Field>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary mt-6"
        >
          <Save size={18} />
          {loading ? "Opslaan…" : "Wijzigingen opslaan"}
        </button>

        {success && (
          <p className="text-green-400 text-sm mt-3">
            ✔ Profiel opgeslagen
          </p>
        )}
      </section>

      {/* BEVEILIGING */}
      <section className="card">
        <SectionTitle icon={Lock} title="Beveiliging" />
        <Action title="Wachtwoord wijzigen" />
        <Action title="Twee-factor authenticatie" />
      </section>

      {/* NOTIFICATIES */}
      <section className="card mt-8">
        <SectionTitle icon={Bell} title="Notificaties" />
        <Toggle title="Email notificaties" subtitle="Updates over analyses" enabled />
        <Toggle title="Marketing emails" subtitle="Tips & aanbiedingen" enabled={false} />
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      <Icon className="text-[#D4AF37]" />
      {title}
    </h2>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label className="label">{label}</label>
      <div className="relative">{children}</div>
    </div>
  );
}

function Action({ title }: { title: string }) {
  return (
    <button className="action">
      <div className="font-semibold text-white">{title}</div>
      <div className="text-sm text-gray-400">Beveiligingsinstelling</div>
    </button>
  );
}

function Toggle({
  title,
  subtitle,
  enabled,
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-sm text-gray-400">{subtitle}</div>
      </div>
      <div
        className={`w-12 h-6 rounded-full ${
          enabled ? "bg-[#D4AF37]" : "bg-gray-600"
        }`}
      />
    </div>
  );
}
