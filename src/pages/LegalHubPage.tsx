import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LegalHubPage() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-16 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-3xl font-bold text-[#D6B48E] mb-6">
          Juridische Documenten
        </h1>
        <p className="text-gray-400 mb-8">
          Hier vind je alle juridische en beleidsdocumenten van Cyntra Insights.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/privacy"
            className="block border border-[#2A2A2A] bg-[#141414] p-6 rounded-xl hover:bg-[#1E1E1E] transition"
          >
            <h2 className="text-xl text-[#D6B48E] mb-2">🔒 Privacyverklaring</h2>
            <p className="text-gray-400 text-sm">
              Lees hoe wij omgaan met jouw persoonsgegevens en gegevensbeveiliging.
            </p>
          </Link>

          <Link
            to="/voorwaarden"
            className="block border border-[#2A2A2A] bg-[#141414] p-6 rounded-xl hover:bg-[#1E1E1E] transition"
          >
            <h2 className="text-xl text-[#D6B48E] mb-2">📜 Algemene Voorwaarden</h2>
            <p className="text-gray-400 text-sm">
              Bekijk de voorwaarden die van toepassing zijn op onze diensten.
            </p>
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-12">
          © {new Date().getFullYear()} Cyntra Insights — Juridische Informatie
        </p>
      </motion.div>
    </div>
  );
}
