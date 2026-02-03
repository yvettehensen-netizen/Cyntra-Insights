// src/pages/portal/RapportenPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Eye,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Search,
  CheckCircle2,
} from "lucide-react";

/* =====================
   TYPES
===================== */
interface Analysis {
  id: string;
  company_name?: string;
  created_at: string;
  status: string;
  truth_delta?: number;
  summary?: string;
}

/* =====================
   COMPONENT
===================== */
export default function RapportenPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [items, setItems] = useState<Analysis[]>([]);
  const [active, setActive] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    if (id) {
      const { data } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();

      setActive(data ?? null);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems(data ?? []);
    setActive(null);
    setLoading(false);
  }

  /* =====================
     DETAIL VIEW
  ===================== */
  if (id && active) {
    return (
      <div className="max-w-5xl">
        <button
          onClick={() => navigate("/portal/rapporten")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] mb-10"
        >
          <ArrowLeft size={18} /> Terug
        </button>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-[#D4AF37]" />
            <span className="uppercase tracking-wider text-sm text-[#D4AF37]">
              Brutal Truth Report
            </span>
          </div>

          <h1 className="text-4xl font-bold">
            {active.company_name || "Onbenoemde organisatie"}
          </h1>

          <p className="text-gray-400 mt-4 max-w-3xl">
            Dit rapport corrigeert geen details.  
            Het corrigeert **zelfbedrog**.
          </p>
        </header>

        <section className="bg-[#151515] border border-white/10 rounded-2xl p-8 mb-14">
          <h2 className="text-2xl font-bold mb-4">De waarheid</h2>
          <p className="text-gray-300 whitespace-pre-line">
            {active.summary ||
              "Strategie wordt verbaal gedragen, maar operationeel genegeerd."}
          </p>
        </section>

        <section className="bg-[#0F0F0F] border border-[#D4AF37]/20 rounded-2xl p-10">
          <h2 className="text-3xl font-bold mb-6 text-[#D4AF37]">
            90-Dagen Correctieplan
          </h2>

          <PlanBlock
            title="Dag 0–30 · Stoppen met schade"
            items={[
              "Besluitvorming centraliseren",
              "Parallelle initiatieven pauzeren",
              "Blokkades expliciet benoemen",
            ]}
          />
        </section>
      </div>
    );
  }

  /* =====================
     OVERZICHT
  ===================== */
  const filtered = items.filter(
    (x) =>
      !search ||
      x.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold">Rapporten</h1>
        <p className="text-gray-400 mt-2">
          Geen rapporten. Alleen beslissingen.
        </p>
      </header>

      <div className="mb-10 relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          placeholder="Zoek organisatie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#151515] border border-white/10 px-12 py-3 rounded-xl"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Laden…</p>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {filtered.map((x) => (
            <div
              key={x.id}
              className="bg-[#151515] border border-white/10 rounded-2xl p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">
                  {x.company_name || "Onbenoemd"}
                </h3>
                <div className="flex gap-4 text-sm text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(x.created_at).toLocaleDateString("nl-NL")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/portal/rapporten/${x.id}`)}
                className="flex items-center gap-2 px-5 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg"
              >
                <Eye size={18} /> Bekijk
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================
   SUBCOMPONENTS
===================== */

function EmptyState() {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-10 text-center">
      <CheckCircle2 className="mx-auto mb-4 text-[#D4AF37]" size={40} />
      <h3 className="text-xl font-semibold mb-2">
        Nog geen rapporten
      </h3>
      <p className="text-gray-400 mb-6">
        Start je eerste analyse om harde beslissingen te krijgen.
      </p>
    </div>
  );
}

function PlanBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="text-[#D4AF37] mt-1" size={18} />
            <span className="text-gray-300">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

