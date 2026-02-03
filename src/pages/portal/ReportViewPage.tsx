import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ReportViewPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setReport(data);
    }

    load();
  }, [id]);

  if (!report) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white px-10 py-20">
      <h1 className="text-3xl text-[#d4af37] mb-6">{report.title}</h1>

      <pre className="text-white/70 whitespace-pre-wrap">
        {JSON.stringify(report.content, null, 2)}
      </pre>
    </div>
  );
}
