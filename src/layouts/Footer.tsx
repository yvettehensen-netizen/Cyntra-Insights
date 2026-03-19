import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#C8A96A]/10 bg-[#0F2A44] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr]">
          <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Cyntra Insights</p>
          <p className="mt-6 text-lg leading-relaxed text-[#D6DEE5]">
            Cyntra Insights ontwikkelt AI-systemen die organisaties helpen strategische keuzes scherper te maken.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#D6DEE5]">
            Aurelius is ontwikkeld als een interventiemachine voor boardrooms.
          </p>
        </div>

          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#C8A96A]">Snelle routes</p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-[#D6DEE5]">
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
              <Link to="/aurelius" className="transition hover:text-white">
                Aurelius
              </Link>
              <Link to="/prijzen" className="transition hover:text-white">
                Prijzen
              </Link>
              <Link to="/scan" className="transition hover:text-white">
                Start korte scan
              </Link>
              <Link to="/aurelius/login" className="transition hover:text-white">
                Login volledig rapport
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-12 text-sm text-[#9FB0C0]">© {new Date().getFullYear()} Cyntra Insights.</p>
      </div>
    </footer>
  );
}
