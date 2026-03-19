import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Bedankt() {
  return (
    <>
      <Helmet>
        <title>Bedankt | Cyntra Insights</title>
      </Helmet>

      <main className="marketing-readable marketing-shell flex min-h-screen items-center text-white">
        <section className="marketing-container">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(200,169,106,0.16),_transparent_32%),linear-gradient(135deg,_#0D1A29_0%,_#10263B_54%,_#0A1624_100%)] px-8 py-14 text-center md:px-12">
            <p className="text-sm uppercase tracking-[0.22em] text-[#C8A96A]">Bedankt</p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-white md:text-6xl">
              Je bericht is ontvangen.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#D6DEE5]">
              We nemen zo snel mogelijk contact met je op. Als je in de tussentijd
              alvast verder wilt, kun je direct de korte scan starten of de Aurelius
              productpagina bekijken.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/scan" className="marketing-btn-primary px-8 py-4 text-base">
                Start korte scan
              </Link>
              <Link to="/aurelius" className="marketing-btn-secondary px-8 py-4 text-base">
                Bekijk Aurelius
              </Link>
              <Link to="/" className="marketing-btn-secondary px-8 py-4 text-base">
                Terug naar homepage
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
