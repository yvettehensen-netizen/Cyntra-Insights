import React from "react";
import { motion } from "framer-motion";
import MainNavbar from "../components/MainNavbar";
import { Briefcase, Users, Zap, Award, DollarSign, Repeat } from "lucide-react";

export default function VoorConsultants() {
  const benefits = [
    {
      icon: Briefcase,
      title: "White-Label Rapporten",
      description: "Plaats jouw eigen logo, kleuren en branding op alle rapporten. Presenteer Cyntra als jouw eigen AI-analyse tool.",
    },
    {
      icon: DollarSign,
      title: "Resale & Commissie",
      description: "Verkoop analyses door aan jouw klanten met aantrekkelijke marges. Earn 30-50% commissie op elke verkoop.",
    },
    {
      icon: Zap,
      title: "Snelheid & Schaal",
      description: "Lever McKinsey-kwaliteit analyses in 24 uur in plaats van 6 weken. Bedien 10x meer klanten met hetzelfde team.",
    },
    {
      icon: Users,
      title: "Bureau Licenties",
      description: "Multi-tenant setup voor adviesbureaus. Beheer al je klanten vanuit één platform met dedicated support.",
    },
    {
      icon: Award,
      title: "Templates & Cloning",
      description: "Bouw je eigen analyse-templates. Clone succesvolle analyses voor vergelijkbare klanten. Maximale efficiëntie.",
    },
    {
      icon: Repeat,
      title: "Recurring Revenue",
      description: "Transformeer eenmalige projecten naar maandelijkse abonnementen. Bouw voorspelbare recurring revenue.",
    },
  ];

  const packages = [
    {
      name: "Partner",
      price: "€995",
      period: "per maand",
      features: [
        "White-label branding",
        "20 analyses per maand",
        "Commissie op doorverkoop",
        "Dedicated account manager",
        "Prioriteit support",
      ],
    },
    {
      name: "Bureau",
      price: "€2.495",
      period: "per maand",
      features: [
        "Alles uit Partner",
        "Onbeperkt analyses",
        "Multi-tenant platform",
        "Custom templates",
        "API toegang",
        "Persoonlijke onboarding",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Op maat",
      period: "vanaf €5.000/maand",
      features: [
        "Alles uit Bureau",
        "Dedicated infrastructure",
        "Custom AI-training",
        "SLA garanties",
        "White-glove service",
        "Revenue share partnerships",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] text-gray-100">
      <MainNavbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold font-playfair text-[#D6B48E] mb-6">
            Voor Consultants & Bureaus
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Lever wereldklasse strategische analyses aan jouw klanten — onder jouw eigen merk.
            Schaal je bureau zonder extra mensen aan te nemen.
          </p>
        </motion.div>

        {/* BENEFITS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1A1A1A]/80 backdrop-blur border border-[#D6B48E]/20 rounded-2xl p-6 hover:border-[#D6B48E]/50 transition-all"
              >
                <div className="p-3 bg-[#D6B48E]/10 rounded-lg w-fit mb-4">
                  <Icon size={28} className="text-[#D6B48E]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* USE CASES */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#2d1319] to-[#1a0a0f] border-2 border-[#D6B48E]/30 rounded-2xl p-10 mb-20"
        >
          <h2 className="text-3xl font-bold text-[#D6B48E] mb-8 text-center">
            Hoe bureaus Cyntra gebruiken
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">🎯 Strategy Consultants</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                "Wij leveren nu 3x zoveel strategische analyses per maand. Cyntra doet het zware
                werk, wij focussen op implementatie en klantrelatie. Onze marges zijn gestegen
                met 40%."
              </p>
              <p className="text-sm text-[#D6B48E] font-semibold">— Strategie Bureau Amsterdam</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">💼 Management Consultants</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                "We bieden nu AI-analyses aan als upsell na onze workshops. 60% van klanten neemt
                het af. Pure recurring revenue zonder extra werklast."
              </p>
              <p className="text-sm text-[#D6B48E] font-semibold">— MC Groep Rotterdam</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">📊 Financial Advisors</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                "Onze klanten willen niet alleen financieel advies, maar ook strategische richting.
                Met Cyntra kunnen we dat leveren zonder strategieconsultants in te huren."
              </p>
              <p className="text-sm text-[#D6B48E] font-semibold">— FinAdvies Utrecht</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">🚀 Growth Agencies</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                "We starten elk klanttraject met een Cyntra-analyse. Hiermee identificeren we
                bottlenecks die marketing alleen niet oplost. Onze conversieratio is verdubbeld."
              </p>
              <p className="text-sm text-[#D6B48E] font-semibold">— Growth Collective</p>
            </div>
          </div>
        </motion.div>

        {/* PACKAGES */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-[#D6B48E] mb-4 text-center">
            Bureau Pakketten
          </h2>
          <p className="text-gray-300 text-center mb-12 text-lg">
            Kies het pakket dat past bij jouw schaal en ambities
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className={`
                  rounded-2xl p-8 flex flex-col
                  ${pkg.highlighted
                    ? "border-2 border-[#D6B48E] bg-gradient-to-br from-[#2d1319] to-[#1a0a0f] scale-105 shadow-2xl shadow-[#D6B48E]/30"
                    : "border border-white/10 bg-[#1A1A1A]/80 backdrop-blur"
                  }
                `}
              >
                {pkg.highlighted && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#D6B48E] to-[#c9a778] text-black text-xs font-bold rounded-full">
                      POPULAIR
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-4xl font-bold text-[#D6B48E] mb-2">
                  {pkg.price}
                </p>
                <p className="text-gray-400 mb-6">{pkg.period}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-300">
                      <span className="text-[#D6B48E] mr-2 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:info@inzichtenimpact.nl?subject=Bureau%20Partnership"
                  className={`
                    block text-center px-6 py-3 rounded-xl font-semibold transition-all
                    ${pkg.highlighted
                      ? "bg-gradient-to-r from-[#D6B48E] to-[#c9a778] text-black hover:shadow-lg hover:shadow-[#D6B48E]/50"
                      : "border border-[#D6B48E] text-[#D6B48E] hover:bg-[#D6B48E]/10"
                    }
                  `}
                >
                  Plan Gesprek
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#D6B48E]/10 to-[#c9a778]/10 border border-[#D6B48E]/30 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om te schalen?
          </h2>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            Plan een demo en ontdek hoe Cyntra jouw bureau helpt groeien zonder extra overhead
          </p>
          <a
            href="mailto:info@inzichtenimpact.nl?subject=Bureau%20Demo%20Aanvraag"
            className="inline-block px-10 py-4 bg-gradient-to-r from-[#D6B48E] to-[#c9a778] text-black font-bold rounded-xl hover:shadow-2xl hover:shadow-[#D6B48E]/50 transition-all text-lg"
          >
            Plan Demo
          </a>
        </motion.div>
      </main>
    </div>
  );
}
