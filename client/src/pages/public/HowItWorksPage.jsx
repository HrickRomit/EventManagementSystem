import Navbar from "../../components/navigation/Navbar";

function HowItWorksPage() {
  return (
    <main className="home-page">
      <Navbar />

      <section className="hero-panel">
        <p className="hero-kicker">How it works</p>
        <h1>Discover, register, organize, and manage in one place.</h1>
        <p className="hero-copy">
          Participants browse and register for events, organizers launch and track their
          experiences, and the admin layer can grow on top of the same account system.
        </p>
      </section>
    </main>
  );
}

export default HowItWorksPage;
