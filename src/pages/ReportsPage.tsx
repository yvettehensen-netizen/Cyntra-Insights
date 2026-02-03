// src/pages/portal/ReportsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Lock,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  created_at: string;
  status: "completed" | "processing" | "failed";
  analysis_type: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, title, created_at, status, analysis_type")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Fout bij ophalen rapporten:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        fetchReports
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statusConfig = {
    completed: {
      label: "Definitief",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-950/40 border-emerald-600/40",
    },
    processing: {
      label: "In analyse",
      icon: Loader2,
      color: "text-amber-400",
      bg: "bg-amber-950/40 border-amber-600/40",
    },
    failed: {
      label: "Onderbroken",
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-950/40 border-red-600/40",
    },
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Besluitrapporten
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl leading-relaxed">
            Elk rapport is een vastlegging van waarheid op een specifiek moment.
            Geen interpretatie, geen optimalisatie — alleen wat bestuurbaar is.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchReports();
          }}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />
          Vernieuwen
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-black/40 border border-white/10 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Reports */}
      {!loading && reports.length > 0 && (
        <div className="space-y-8">
          {reports.map((report) => {
            const cfg = statusConfig[report.status];
            const Icon = cfg.icon;

            return (
              <Link
                key={report.id}
                to={`/portal/rapport/${report.id}`}
                className="group block rounded-3xl border border-white/10 bg-black/40 p-10 hover:border-[#D4AF37]/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-[#D4AF37]">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Clock size={14} />
                      {formatDate(report.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl border ${cfg.bg}`}
                    >
                      <Icon
                        size={20}
                        className={`${cfg.color} ${
                          report.status === "processing" ? "animate-spin" : ""
                        }`}
                      />
                      <span className={`font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <ArrowRight
                      size={28}
                      className="text-[#D4AF37] opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-4 transition"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && reports.length === 0 && (
        <div className="text-center py-32">
          <FileText size={72} className="text-gray-600 mx-auto mb-8" />
          <h2 className="text-3xl font-bold mb-4">
            Nog geen besluitrapporten
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Start een analyse om structurele spanningen zichtbaar te maken
            voordat ze strategische schade veroorzaken.
          </p>
          <Link
            to="/portal"
            className="inline-flex items-center gap-4 px-16 py-6 rounded-2xl bg-[#D4AF37] text-black font-bold text-xl hover:bg-[#e0c04a]"
          >
            <Plus size={24} />
            Start analyse
          </Link>
        </div>
      )}

      {/* Trust */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Lock size={14} />
        Vertrouwelijk • Boardroom-niveau • Geen dataretentie
      </div>
    </div>
  );
}
