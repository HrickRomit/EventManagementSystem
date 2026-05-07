import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/navigation/Navbar";
import weddingImage from "../../components/images/wedding.png";
import concertImage from "../../components/images/concert.png";
import hackathonImage from "../../components/images/hackathon.png";
import sportsImage from "../../components/images/sports.png";
import seminarImage from "../../components/images/seminar.png";
import weddingImage2 from "../../components/images/wedding2.png";
import concertImage2 from "../../components/images/concert2.png";
import { bookEvent, getPublicEvents } from "../../services/events";
import { useAuth } from "../../context/AuthContext";

function EventsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPublishedEvent, setSelectedPublishedEvent] = useState(null);
  const [selectedTicketCategory, setSelectedTicketCategory] = useState("");
  const [bookingStatus, setBookingStatus] = useState({ type: "", message: "" });
  const [isBooking, setIsBooking] = useState(false);
  const [publishedEvents, setPublishedEvents] = useState([]);

  useEffect(() => {
    getPublicEvents()
      .then(({ data }) => setPublishedEvents(data.events))
      .catch(() => setPublishedEvents([]));
  }, []);

  useEffect(() => {
    if (selectedPublishedEvent?.entryType === "tickets") {
      setSelectedTicketCategory(
        selectedPublishedEvent.ticket?.categories?.find((category) => category.available > 0)?.name || ""
      );
    } else {
      setSelectedTicketCategory("");
    }

    setBookingStatus({ type: "", message: "" });
    setIsBooking(false);
  }, [selectedPublishedEvent?._id]);

  useEffect(() => {
    if (!selectedEvent && !selectedPublishedEvent) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedEvent(null);
        setSelectedPublishedEvent(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEvent, selectedPublishedEvent]);

  const getLowestTicketPrice = (event) => {
    if (event.entryType !== "tickets" || !event.ticket?.categories?.length) {
      return null;
    }

    return Math.min(...event.ticket.categories.map((category) => Number(category.price)));
  };

  const getBookingButtonLabel = (event) => {
    if (!event) {
      return "Book Event";
    }

    if (event.capacity <= 0) {
      return "Sold Out";
    }

    if (event.entryType === "tickets") {
      return isBooking ? "Booking..." : "Book Ticket";
    }

    return isBooking ? "Registering..." : "Register";
  };

  const handleBookEvent = async () => {
    if (!selectedPublishedEvent) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "participant") {
      setBookingStatus({ type: "error", message: "Only participant accounts can book events." });
      return;
    }

    if (selectedPublishedEvent.entryType === "tickets" && !selectedTicketCategory) {
      setBookingStatus({ type: "error", message: "Choose a ticket category first." });
      return;
    }

    setIsBooking(true);
    setBookingStatus({ type: "", message: "" });

    try {
      const { data } = await bookEvent(selectedPublishedEvent._id, {
        ticketCategory: selectedTicketCategory || undefined
      });

      setPublishedEvents((events) =>
        events.map((event) => (event._id === data.event._id ? data.event : event))
      );
      setSelectedPublishedEvent(data.event);
      setBookingStatus({ type: "success", message: "Booking confirmed. Your seat has been reserved." });
    } catch (error) {
      setBookingStatus({
        type: "error",
        message: error.response?.data?.message || "Booking failed. Please try again."
      });
    } finally {
      setIsBooking(false);
    }
  };

  const eventCategories = [
    {
      name: "Wedding",
      modalKey: "wedding",
      description: "Elegant venues, guest coordination, and unforgettable celebration details.",
      accentClass: "event-card-wedding",
      image: weddingImage,
      imageAlt: "Wedding table setup with floral decorations",
      modalImage: weddingImage2,
      modalImageAlt: "Wedding venue decorated with flowers and candles",
      modalClass: "event-modal-wedding",
      kickerClass: "",
      statClass: "",
      modalTitle: "Plan a wedding event that feels personal and seamless.",
      details: {
        intro:
          "Design a wedding experience with curated venues, planning support, and a guest journey that feels effortless from invitation to final dance.",
        highlights: [
          "Venue styling, floral direction, and table design tailored to your theme",
          "Guest RSVP tracking, seating plans, and timeline management in one place",
          "Vendor coordination for catering, photography, entertainment, and transport",
        ],
        stats: [
          { label: "Popular Format", value: "Indoor + Garden" },
          { label: "Planning Window", value: "3-9 Months" },
          { label: "Guest Capacity", value: "80-600 Guests" },
        ],
      },
    },
    {
      name: "Concert",
      modalKey: "concert",
      description: "Live music nights, ticketed crowds, and stage-ready production energy.",
      image: concertImage,
      accentClass: "event-card-concert",
      imageAlt: "Concert crowd enjoying a live performance with stage lighting",
      modalImage: concertImage2,
      modalImageAlt: "Concert crowd under colorful stage lights",
      modalClass: "event-modal-concert",
      kickerClass: "event-modal-kicker-concert",
      statClass: "event-modal-stat-concert",
      modalTitle: "Discover concert events built around sound, lights, and crowd energy.",
      details: {
        intro:
          "Step into high-energy concert experiences with polished staging, audience flow planning, and a lineup atmosphere built for memorable live moments.",
        highlights: [
          "Stage production planning with lighting, sound, and artist-ready schedules",
          "Ticketing flow, crowd management, and entry coordination for smoother event access",
          "Food zones, merchandise booths, and fan engagement spaces designed around the show",
        ],
        stats: [
          { label: "Best Setting", value: "Arena + Open Air" },
          { label: "Show Length", value: "2-5 Hours" },
          { label: "Audience Size", value: "300-10k Fans" },
        ],
      },
    },
    {
      name: "Hackathon",
      modalKey: "hackathon",
      description: "Build, pitch, and collaborate through fast-paced innovation challenges.",
      image: hackathonImage,
      accentClass: "event-card-hackathon",
      imageAlt: "Hackathon team collaborating with laptops and sticky notes",
      modalImage: hackathonImage,
      modalImageAlt: "Participants brainstorming and coding during a hackathon",
      modalClass: "event-modal-hackathon",
      kickerClass: "event-modal-kicker-hackathon",
      statClass: "event-modal-stat-hackathon",
      modalTitle: "Launch bold ideas in a hackathon built for momentum and teamwork.",
      details: {
        intro:
          "Explore high-focus hackathon formats with mentor support, challenge tracks, and showcase moments that help teams build quickly and present confidently.",
        highlights: [
          "Problem statements, coding tracks, and judging criteria organized from kickoff to demo day",
          "Mentor sessions, breakout collaboration zones, and sponsor touchpoints throughout the event",
          "Submission flow, finalist presentations, and awards designed for strong project visibility",
        ],
        stats: [
          { label: "Typical Format", value: "24-48 Hours" },
          { label: "Team Size", value: "2-5 Builders" },
          { label: "Best For", value: "Tech + Innovation" },
        ],
      },
    },
    {
      name: "Sports",
      modalKey: "sports",
      description: "Tournament days, team matchups, and high-energy fan experiences.",
      image: sportsImage,
      accentClass: "event-card-sports",
      imageAlt: "Sports crowd cheering during a competitive match",
      modalImage: sportsImage,
      modalImageAlt: "Athletes competing in a packed sports arena",
      modalClass: "event-modal-sports",
      kickerClass: "event-modal-kicker-sports",
      statClass: "event-modal-stat-sports",
      modalTitle: "Bring sports events to life with sharper scheduling and fan energy.",
      details: {
        intro:
          "Organize sports events that balance match logistics, team coordination, and an exciting spectator atmosphere across every round of competition.",
        highlights: [
          "Fixture planning, bracket flow, and venue timing that keeps every match on schedule",
          "Team registration, official coordination, and player-ready support areas",
          "Audience seating, concession zones, and sponsor branding built around the action",
        ],
        stats: [
          { label: "Event Style", value: "League + Tournament" },
          { label: "Match Window", value: "1-3 Days" },
          { label: "Audience Mood", value: "High Energy" },
        ],
      },
    },
    {
      name: "Seminar",
      modalKey: "seminar",
      description: "Speaker-led sessions, networking opportunities, and professional learning.",
      image: seminarImage,
      accentClass: "event-card-seminar",
      imageAlt: "Audience attending a professional seminar presentation",
      modalImage: seminarImage,
      modalImageAlt: "Speaker presenting to a seminar audience",
      modalClass: "event-modal-seminar",
      kickerClass: "event-modal-kicker-seminar",
      statClass: "event-modal-stat-seminar",
      modalTitle: "Host seminar events that feel polished, insightful, and easy to navigate.",
      details: {
        intro:
          "Shape seminar experiences around strong speakers, smooth session flow, and meaningful networking moments that make the learning environment feel premium.",
        highlights: [
          "Speaker schedules, registration desks, and session timing planned for a smooth attendee journey",
          "Presentation zones, breakout discussions, and sponsor visibility built into the venue layout",
          "Check-in flow, post-session networking, and feedback collection in one organized experience",
        ],
        stats: [
          { label: "Common Setup", value: "Keynote + Breakouts" },
          { label: "Session Range", value: "45-90 Minutes" },
          { label: "Audience Focus", value: "Learning + Networking" },
        ],
      },
    },
  ];

  const modalEnabledEvents = new Set(["Wedding", "Concert", "Hackathon", "Sports", "Seminar"]);

  return (
    <main className="home-page">
      <Navbar />

      <section className="hero-panel">
        <p className="hero-kicker">Explore upcoming experiences</p>
        <h1>Choose your kind of event.</h1>
        <p className="hero-copy">
          Browse event categories and jump into the kind of experience you want to
          discover next.
        </p>

        {publishedEvents.length > 0 ? (
          <div className="published-event-grid">
            {publishedEvents.map((event) => (
              <button key={event._id} type="button" className="published-event-card published-event-card-button" onClick={() => setSelectedPublishedEvent(event)}>
                {event.eventImage ? (
                  <img className="published-event-image" src={event.eventImage} alt={event.name} />
                ) : (
                  <div className="published-event-image published-event-image-empty" />
                )}
                <span className="event-card-tag">Published</span>
                <h2>{event.name}</h2>
                <p>{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                {getLowestTicketPrice(event) !== null ? <strong>From BDT {getLowestTicketPrice(event)}</strong> : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="event-card-grid">
          {eventCategories.map((category) =>
            modalEnabledEvents.has(category.name) ? (
              <article
                key={category.name}
                className={`event-card ${category.accentClass}`}
              >
                <span className="event-card-tag">Featured</span>
                {category.image ? (
                  <button
                    type="button"
                    className="event-card-media event-card-media-button"
                    onClick={() => setSelectedEvent(category)}
                    aria-label={`Open ${category.name.toLowerCase()} event details`}
                  >
                    <img src={category.image} alt={category.imageAlt} />
                  </button>
                ) : null}
                <h2>{category.name}</h2>
                <p>{category.description}</p>
                <button
                  type="button"
                  className="event-card-cta event-card-cta-button"
                  onClick={() => setSelectedEvent(category)}
                >
                  Explore {category.name}
                </button>
              </article>
            ) : (
              <Link
                key={category.name}
                className={`event-card ${category.accentClass}`}
                to={`/events?category=${encodeURIComponent(category.name)}`}
              >
                <span className="event-card-tag">Featured</span>
                {category.image ? (
                  <div className="event-card-media">
                    <img src={category.image} alt={category.imageAlt} />
                  </div>
                ) : null}
                <h2>{category.name}</h2>
                <p>{category.description}</p>
                <span className="event-card-cta">Explore {category.name}</span>
              </Link>
            ),
          )}
        </div>
      </section>

      {selectedEvent ? (
        <div
          className="event-modal-backdrop"
          onClick={() => setSelectedEvent(null)}
          role="presentation"
        >
          <section
            className={`event-modal ${selectedEvent.modalClass}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${selectedEvent.modalKey}-modal-title`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="event-modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label={`Close ${selectedEvent.name.toLowerCase()} event details`}
            >
              x
            </button>

            <div className="event-modal-content">
              <div className="event-modal-visual">
                <img src={selectedEvent.modalImage} alt={selectedEvent.modalImageAlt} />
              </div>

              <div className="event-modal-copy">
                <p className={`event-modal-kicker ${selectedEvent.kickerClass}`.trim()}>
                  {selectedEvent.name} Experiences
                </p>
                <h2 id={`${selectedEvent.modalKey}-modal-title`}>{selectedEvent.modalTitle}</h2>
                <p className="event-modal-intro">
                  {selectedEvent.details.intro}
                </p>

                <div className="event-modal-stats" aria-label={`${selectedEvent.name} event quick facts`}>
                  {selectedEvent.details.stats.map((item) => (
                    <div
                      key={item.label}
                      className={`event-modal-stat ${selectedEvent.statClass}`.trim()}
                    >
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="event-modal-section">
                  <h3>What you can explore</h3>
                  <ul>
                    {selectedEvent.details.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>

                <div className="event-modal-actions">
                  <Link
                    className="nav-button nav-button-primary"
                    to={`/events?category=${encodeURIComponent(selectedEvent.name)}`}
                  >
                    View {selectedEvent.name} Events
                  </Link>
                  <button
                    type="button"
                    className="nav-button nav-button-secondary"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedPublishedEvent ? (
        <div className="event-modal-backdrop" onClick={() => setSelectedPublishedEvent(null)} role="presentation">
          <section className="event-modal event-details-modal" role="dialog" aria-modal="true" aria-labelledby="published-event-details-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="event-modal-close" onClick={() => setSelectedPublishedEvent(null)} aria-label="Close event details">
              x
            </button>
            <div className="event-modal-content">
              <div className="event-modal-visual">
                {selectedPublishedEvent.eventImage ? <img src={selectedPublishedEvent.eventImage} alt={selectedPublishedEvent.name} /> : null}
              </div>
              <div className="event-modal-copy">
                <p className="event-modal-kicker">{selectedPublishedEvent.eventType || "Event"}</p>
                <h2 id="published-event-details-title">{selectedPublishedEvent.name}</h2>
                <p className="event-modal-intro">{selectedPublishedEvent.organizerName}</p>
                <div className="event-modal-stats">
                  <div className="event-modal-stat"><span>Date</span><strong>{new Date(selectedPublishedEvent.date).toLocaleDateString()} at {selectedPublishedEvent.time}</strong></div>
                  <div className="event-modal-stat"><span>Venue</span><strong>{selectedPublishedEvent.venue}</strong></div>
                  <div className="event-modal-stat"><span>Capacity</span><strong>{selectedPublishedEvent.capacity}</strong></div>
                  <div className="event-modal-stat"><span>Duration</span><strong>{selectedPublishedEvent.duration}</strong></div>
                </div>
                <div className="event-modal-section">
                  <h3>Contact</h3>
                  <p>{selectedPublishedEvent.contactNumber}</p>
                  <p>{selectedPublishedEvent.contactEmail}</p>
                </div>
                {selectedPublishedEvent.entryType === "tickets" && selectedPublishedEvent.ticket?.categories?.length > 0 ? (
                  <div className="booking-ticket-panel">
                    <div className="overview-ticket-tiers">
                    {selectedPublishedEvent.ticket.categories.map((category) => (
                      <label key={category.name} className={`booking-ticket-choice ${selectedTicketCategory === category.name ? "booking-ticket-choice-active" : ""} ${category.available <= 0 ? "booking-ticket-choice-disabled" : ""}`}>
                        <input
                          type="radio"
                          name="ticketCategory"
                          value={category.name}
                          checked={selectedTicketCategory === category.name}
                          disabled={category.available <= 0 || isBooking}
                          onChange={() => setSelectedTicketCategory(category.name)}
                        />
                        <span>{category.name}</span>
                        <strong>BDT {category.price} - {category.available} left</strong>
                      </label>
                    ))}
                    </div>
                  </div>
                ) : (
                  <p className="event-modal-intro">Access: {selectedPublishedEvent.entryType}</p>
                )}
                {selectedPublishedEvent.entryType !== "none" ? (
                  <div className="event-modal-actions">
                    <button
                      type="button"
                      className="nav-button nav-button-primary"
                      onClick={handleBookEvent}
                      disabled={isBooking || selectedPublishedEvent.capacity <= 0}
                    >
                      {getBookingButtonLabel(selectedPublishedEvent)}
                    </button>
                    <Link className="nav-button nav-button-secondary" to="/participant/registrations">
                      My Registrations
                    </Link>
                  </div>
                ) : null}
                {bookingStatus.message ? (
                  <p className={`booking-message booking-message-${bookingStatus.type}`}>
                    {bookingStatus.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default EventsPage;
