import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand-mark" to="/">
          EventSphere
        </Link>

        <nav className="home-nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="home-actions">
          <a className="nav-button nav-button-secondary" href="#login">
            Log In
          </a>
          <a className="nav-button nav-button-primary" href="#signup">
            Get Started
          </a>
        </div>
      </header>

      <section className="hero-panel" id="home">
        <p className="hero-kicker">Plan and join standout events with ease</p>
        <h1>One place for guests, participants, and organizers to connect.</h1>
        <p className="hero-copy">
          This homepage will introduce the platform, highlight featured events, and
          guide visitors toward registering, attending, or creating events.
        </p>
      </section>
    </main>
  );
}

export default HomePage;
