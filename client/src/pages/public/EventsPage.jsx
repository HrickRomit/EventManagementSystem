import { Link } from "react-router-dom";
import weddingImage from "../../components/images/wedding.png";
import concertImage from "../../components/images/concert.png";
import hackathonImage from "../../components/images/hackathon.png";
import sportsImage from "../../components/images/sports.png";
import seminarImage from "../../components/images/seminar.png";

function EventsPage() {
  const eventCategories = [
    {
      name: "Wedding",
      description: "Elegant venues, guest coordination, and unforgettable celebration details.",
      accentClass: "event-card-wedding",
      image: weddingImage,
      imageAlt: "Wedding table setup with floral decorations",
    },
    {
      name: "Concert",
      description: "Live music nights, ticketed crowds, and stage-ready production energy.",
      image: concertImage,
      accentClass: "event-card-concert",
    },
    {
      name: "Hackathon",
      description: "Build, pitch, and collaborate through fast-paced innovation challenges.",
      image: hackathonImage,
      accentClass: "event-card-hackathon",
    },
    {
      name: "Sports",
      description: "Tournament days, team matchups, and high-energy fan experiences.",
      image: sportsImage,
      accentClass: "event-card-sports",
    },
    {
      name: "Seminar",
      description: "Speaker-led sessions, networking opportunities, and professional learning.",
      image: seminarImage,
      accentClass: "event-card-seminar",
    },
  ];

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand-mark" to="/">
          EventSphere
        </Link>

        <nav className="home-nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <a href="#how-it-works">How We Operate</a>
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

      <section className="hero-panel">
        <p className="hero-kicker">Explore upcoming experiences</p>
        <h1>Choose your kind of event.</h1>
        <p className="hero-copy">
          Browse event categories and jump into the kind of experience you want to
          discover next.
        </p>

        <div className="event-card-grid">
          {eventCategories.map((category) => (
            <Link
              key={category.name}
              className={`event-card ${category.accentClass}`}
              to={`/events?category=${encodeURIComponent(category.name)}`}
            >
              <span className="event-card-tag"></span>
              {category.image ? (
                <div className="event-card-media">
                  <img src={category.image} alt={category.imageAlt} />
                </div>
              ) : null}
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <span className="event-card-cta">Explore {category.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default EventsPage;
