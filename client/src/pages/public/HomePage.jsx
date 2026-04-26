import { Link } from "react-router-dom";
import Navbar from "../../components/navigation/Navbar";

function HomePage() {
  return (
    <main className="home-page">
      <Navbar />

      <section className="hero-panel" id="home">
        <p className="hero-kicker">Plan and join standout events with ease</p>
        <h1>One place for guests, participants, and organizers to connect.</h1>
        <p className="hero-copy">
          Discover events, create organizer accounts, and build toward a full event
          management workflow with shared authentication from day one.
        </p>
        <div className="event-card-grid">
          <Link className="event-card event-card-hackathon" to="/register">
            <span className="event-card-tag">Participants</span>
            <h2>Join events</h2>
            <p>Create a participant account to register, track bookings, and manage your profile.</p>
            <span className="event-card-cta">Register now</span>
          </Link>

          <Link className="event-card event-card-concert" to="/register">
            <span className="event-card-tag">Organizers</span>
            <h2>Launch experiences</h2>
            <p>Open an organizer account to manage listings, registrations, and attendee flow.</p>
            <span className="event-card-cta">Start building</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
