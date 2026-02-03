export default function AIUsagePage() {
  return (
    <>
      <h1 className="text-5xl font-bold mb-8">Responsible Use of AI</h1>

      <p className="text-xl text-gray-400 mb-12">
        Cyntra maakt gebruik van AI als ondersteunend instrument — niet als
        autonome beslisser.
      </p>

      <section className="space-y-8">
        <Item
          title="Besluitvorming"
          text="Cyntra neemt geen geautomatiseerde beslissingen."
        />

        <Item
          title="Transparantie"
          text="De gebruiker blijft verantwoordelijk voor interpretatie en toepassing."
        />

        <Item
          title="Beperkingen"
          text="AI-output kan onvolledig of onjuist zijn."
        />

        <Item
          title="Geen profiling"
          text="Cyntra voert geen geautomatiseerde profiling uit op personen."
        />

        <Item
          title="Menselijke controle"
          text="Alle rapportages zijn mens-leesbaar en bedoeld voor professionals."
        />
      </section>
    </>
  );
}

function Item({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}
