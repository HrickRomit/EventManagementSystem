import Navbar from "../../components/navigation/Navbar";

function AboutPage() {
  return (
    <main className="home-page">
      <Navbar />

      <section className="hero-panel">
        <p className="hero-kicker">About EventSphere</p>
        <h1>A shared platform for event discovery and event operations.</h1>
        <p className="hero-copy">
          EventSphere brings participants and organizers into one workflow, from discovery
          and registration to planning and event management.
        </p>
      </section>
    </main>
  );
}

export default AboutPage;
