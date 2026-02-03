import { Link } from "react-router-dom";

export default function RootSidebar() {
  return (
    <div className="w-64 bg-black border-r border-white/10 min-h-screen p-6 text-white">
      <h2 className="text-xl font-bold mb-6">Aurelius Admin</h2>

      <nav className="flex flex-col gap-3">
        <Link to="/root" className="text-gray-300 hover:text-white">
          Dashboard
        </Link>
        <Link to="/root/analyses" className="text-gray-300 hover:text-white">
          Analyses
        </Link>
        <Link to="/root/users" className="text-gray-300 hover:text-white">
          Gebruikers
        </Link>
        <Link to="/root/engine" className="text-gray-300 hover:text-white">
          Engine
        </Link>
      </nav>
    </div>
  );
}
