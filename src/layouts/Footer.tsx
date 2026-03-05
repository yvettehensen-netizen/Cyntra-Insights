import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t divider-cyntra bg-[#0e121a]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-cyntra-gold">Cyntra Insights</p>
            <p className="mt-2 text-sm text-cyntra-secondary">Bestuurlijke Interventiepartner</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-cyntra-secondary">
            <Link to="/hoe-het-werkt" className="hover:text-cyntra-primary">Hoe het werkt</Link>
            <Link to="/besluitdocument" className="hover:text-cyntra-primary">Besluitdocument</Link>
            <Link to="/sectoren" className="hover:text-cyntra-primary">Sectoren</Link>
            <Link to="/pricing" className="hover:text-cyntra-primary">Toegang</Link>
            <Link to="/scan" className="hover:text-cyntra-primary">Scan</Link>
          </div>

          <div className="rounded-xl p-5 shadow-md bg-gradient-to-b from-[#171d29] to-[#111720] border divider-cyntra">
            <p className="text-xs uppercase tracking-[0.14em] text-cyntra-gold mb-3">Besloten Toegang</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-cyntra-secondary">
              <Link to="/portal" className="font-semibold text-cyntra-gold hover:text-[#D4B878]">Portal</Link>
              <Link to="/aurelius/login" className="hover:text-cyntra-primary">Login</Link>
              <Link to="/contact" className="hover:text-cyntra-primary">Bestuurlijke Intake</Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-cyntra-secondary">© {new Date().getFullYear()} Cyntra Insights.</p>
      </div>
    </footer>
  );
}
