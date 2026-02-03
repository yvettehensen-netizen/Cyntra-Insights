export default function SecurityPage() {
  return (
    <>
      <h1 className="text-5xl font-bold mb-8">Security by Design</h1>

      <p className="text-xl text-gray-400 mb-12">
        Cyntra is gebouwd met veiligheid als uitgangspunt — niet als toevoeging.
        Elke analyse, elk rapport en elke interactie volgt security-first principes.
      </p>

      <section className="space-y-10">
        <Block
          title="Minimal Data Exposure"
          text="Cyntra verwerkt uitsluitend data die noodzakelijk is voor het uitvoeren van een analyse."
        />

        <Block
          title="Isolated Processing"
          text="Analyseprocessen worden logisch geïsoleerd uitgevoerd."
        />

        <Block
          title="No Training on Client Data"
          text="Gebruikersdata wordt nooit gebruikt voor training of verbetering van AI-modellen."
        />

        <Block
          title="Access Control"
          text="Rapporten zijn uitsluitend toegankelijk voor geautoriseerde gebruikers."
        />

        <Block
          title="Security Monitoring"
          text="Systeemtoegang wordt gemonitord om ongeautoriseerde activiteiten te detecteren."
        />
      </section>
    </>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-white/10 rounded-xl p-6 bg-white/5">
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}
