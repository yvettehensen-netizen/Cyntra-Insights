import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-gray-200 px-6 py-16 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-[#D6B48E] mb-6">
          Privacyverklaring
        </h1>
        <p className="text-gray-400 mb-6">
          Cyntra Insights respecteert jouw privacy en beschermt je persoonlijke
          gegevens volgens de Europese AVG-wetgeving. Deze verklaring legt uit
          hoe wij gegevens verzamelen, gebruiken en beveiligen.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-4">
          1. Gegevensverwerking
        </h2>
        <p className="text-gray-400 mb-6">
          Wij verzamelen alleen gegevens die nodig zijn voor het uitvoeren van
          onze analyses, zoals bedrijfsinformatie en antwoorden uit
          vragenlijsten. Deze data wordt uitsluitend gebruikt om gepersonaliseerde
          inzichten te genereren.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-4">
          2. Dataopslag en beveiliging
        </h2>
        <p className="text-gray-400 mb-6">
          Alle gegevens worden versleuteld opgeslagen op beveiligde servers in
          de EU. Wij delen geen informatie met derden zonder toestemming.
        </p>

        <h2 className="text-2xl font-semibold text-[#D6B48E] mt-10 mb-4">
          3. Contact
        </h2>
        <p className="text-gray-400">
          Heb je vragen over je privacy of wil je inzage in jouw data? Neem
          contact op via{" "}
          <a href="mailto:privacy@cyntra.ai" className="text-[#D6B48E] underline">
            privacy@cyntra.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}

