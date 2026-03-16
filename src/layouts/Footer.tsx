export default function Footer() {
  return (
    <footer className="border-t border-[#C8A96A]/10 bg-[#0F2A44] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Cyntra Insights</p>
          <p className="mt-6 text-lg leading-relaxed text-[#D6DEE5]">
            Cyntra Insights ontwikkelt AI-systemen die organisaties helpen strategische keuzes scherper te maken.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#D6DEE5]">
            Aurelius is ontwikkeld als een interventiemachine voor boardrooms.
          </p>
        </div>

        <p className="mt-12 text-sm text-[#9FB0C0]">© {new Date().getFullYear()} Cyntra Insights.</p>
      </div>
    </footer>
  );
}
