export default function ReportDownloadButton({
  report,
}: {
  report: any;
}) {
  const download = async () => {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });

    if (!res.ok) {
      alert("PDF generatie mislukt");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <button
      onClick={download}
      className="bg-[#D6B48E] text-black px-6 py-2 rounded-lg font-semibold"
    >
      Download rapport (PDF)
    </button>
  );
}
