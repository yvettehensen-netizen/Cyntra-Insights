import React from "react";
import { motion } from "framer-motion";

export default function AiCodePage() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-8 py-16 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-[#D6B48E] mb-6 font-playfair">
          AI Gedragscode
        </h1>

        <p className="text-gray-400 mb-6">
          Bij Cyntra Insights geloven we in de kracht van kunstmatige intelligentie — mits verantwoord
          toegepast. Deze gedragscode beschrijft hoe wij AI op een ethische, transparante en veilige manier
          inzetten binnen onze diensten.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-2">
          1. Transparantie & uitlegbaarheid
        </h2>
        <p className="text-gray-400 mb-4">
          Onze analyses worden uitgevoerd met behulp van GPT-4o en andere AI-modellen.  
          Wij vermelden altijd duidelijk wanneer AI is ingezet en geven gebruikers inzicht in de manier waarop conclusies tot stand komen.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-2">
          2. Privacy en dataminimalisatie
        </h2>
        <p className="text-gray-400 mb-4">
          Wij verwerken uitsluitend de data die strikt noodzakelijk is voor het uitvoeren van analyses.  
          Alle invoerdata (zoals CSV-bestanden of bedrijfsgegevens) wordt automatisch verwijderd na verwerking.  
          Cyntra Insights is volledig AVG-compliant en voldoet aan de principes van de Europese AI Act.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-2">
          3. Menselijke controle
        </h2>
        <p className="text-gray-400 mb-4">
          AI ondersteunt, maar vervangt geen menselijk oordeel.  
          Alle aanbevelingen van onze systemen zijn bedoeld als hulpmiddel voor besluitvorming, niet als automatische beslissingen.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-2">
          4. Eerlijke en onbevooroordeelde algoritmen
        </h2>
        <p className="text-gray-400 mb-4">
          Cyntra Insights traint en evalueert modellen continu om bias te verminderen.  
          We streven naar gelijke behandeling van alle gebruikers, organisaties en sectoren in onze analyses.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-2">
          5. Beveiliging en integriteit
        </h2>
        <p className="text-gray-400 mb-4">
          Alle data wordt versleuteld opgeslagen en verwerkt in beveiligde omgevingen.  
          Wij gebruiken geen AI-modellen die data opslaan of hergebruiken buiten onze controle.  
          Onze infrastructuur voldoet aan ISO 27001-normen en EU-veiligheidsstandaarden.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-2">
          6. Mensgerichte innovatie
        </h2>
        <p className="text-gray-400 mb-6">
          Onze AI-oplossingen zijn ontworpen om mensen te versterken, niet te vervangen.  
          Wij zien AI als een strategische partner die bedrijven helpt betere, bewustere beslissingen te nemen.
        </p>

        <p className="text-gray-500 mt-12 text-sm">
          Laatste update: {new Date().toLocaleDateString("nl-NL")}
        </p>
      </motion.div>
    </div>
  );
}
