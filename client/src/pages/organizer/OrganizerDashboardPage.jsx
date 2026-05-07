import { useEffect, useMemo, useState } from "react";
import TicketActions from "../../components/cart/TicketActions";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { getOrganizerEvents } from "../../services/events";

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatEventDate = (event) =>
  `${new Date(event.date).toLocaleDateString()} at ${event.time}`;

const eventDateTime = (event) => new Date(`${event.date.slice(0, 10)}T${event.time || "00:00"}`);

const getLowestTicketPrice = (event) => {
  if (event.entryType !== "tickets" || !event.ticket?.categories?.length) {
    return null;
  }

  return Math.min(...event.ticket.categories.map((category) => Number(category.price)));
};

const EventSummaryCard = ({ event, onSelect }) => (
  <article className="overview-event-card">
    {event.eventImage ? (
      <img className="overview-event-image" src={event.eventImage} alt={event.name} />
    ) : (
      <div className="overview-event-image overview-event-image-empty" />
    )}
    <div className="overview-event-card-copy">
      <h3>{event.name}</h3>
      <p>{formatEventDate(event)}</p>
      {getLowestTicketPrice(event) !== null ? <strong>From BDT {getLowestTicketPrice(event)}</strong> : null}
      <div className="published-event-actions">
        <button type="button" className="event-details-button" onClick={() => onSelect(event)}>
          Details
        </button>
        <TicketActions event={event} />
      </div>
    </div>
  </article>
);

const EventDetailsModal = ({ event, onClose }) => {
  const { openTicketSelector } = useCart();

  return (
    <div className="event-modal-backdrop" onClick={onClose} role="presentation">
      <section className="event-modal event-details-modal" role="dialog" aria-modal="true" aria-labelledby="organizer-event-details-title" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <button type="button" className="event-modal-close" onClick={onClose} aria-label="Close event details">
          x
        </button>
        <div className="event-modal-content">
          <div className="event-modal-visual">
            {event.eventImage ? <img src={event.eventImage} alt={event.name} /> : null}
          </div>
          <div className="event-modal-copy">
            <p className="event-modal-kicker">{event.eventType || "Event"}</p>
            <h2 id="organizer-event-details-title">{event.name}</h2>
            <div className="event-modal-stats">
              <div className="event-modal-stat"><span>Date</span><strong>{formatEventDate(event)}</strong></div>
              <div className="event-modal-stat"><span>Venue</span><strong>{event.venue}</strong></div>
              <div className="event-modal-stat"><span>Capacity</span><strong>{event.capacity}</strong></div>
              <div className="event-modal-stat"><span>Duration</span><strong>{event.duration}</strong></div>
            </div>
            <div className="event-modal-section">
              <h3>Contact</h3>
              <p>{event.contactNumber}</p>
              <p>{event.contactEmail}</p>
            </div>
            {event.entryType === "tickets" && event.ticket?.categories?.length > 0 ? (
              <div className="overview-ticket-tiers">
                {event.ticket.categories.map((category) => (
                  <div key={category.name} className="ticket-category-row">
                    <div className="ticket-category-info">
                      <span>{category.name}</span>
                      <strong>BDT {category.price} - {category.available} left</strong>
                    </div>
                    <button 
                      type="button" 
                      className="ticket-buy-button"
                      onClick={() => openTicketSelector(event, category.name)}
                      disabled={category.available <= 0}
                      aria-label={`Buy ${category.name} ticket`}
                    >
                      {category.available > 0 ? "Buy Now" : "Sold Out"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="event-modal-intro">Access: {event.entryType}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrganizerEvents()
      .then(({ data }) => {
        setEvents(data.events);
        setError("");
      })
      .catch(() => {
        setError("Could not load your events.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const { upcomingEvents, happenedEvents } = useMemo(() => {
    const today = startOfToday();
    const sortedEvents = [...events].sort((first, second) => {
      return eventDateTime(first) - eventDateTime(second);
    });

    return {
      upcomingEvents: sortedEvents.filter((event) => new Date(event.date) >= today),
      happenedEvents: sortedEvents.filter((event) => new Date(event.date) < today).reverse()
    };
  }, [events]);

  return (
    <section className="organizer-overview">
      <article className="dashboard-card dashboard-card-hero organizer-overview-hero">
        <p className="dashboard-card-kicker">Organizer dashboard</p>
        <h2>Organization Name: {user.organizationName || user.name}</h2>
        <p>
          Review all events created from Organizer Studio, starting with upcoming events and followed by events that already happened.
        </p>
      </article>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <p className="loading-message">Loading events...</p>
      ) : (
        <>
          <section className="overview-section">
            <div className="overview-section-heading">
              <p className="dashboard-card-kicker">Upcoming events</p>
              <span>{upcomingEvents.length}</span>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="overview-event-grid">
                {upcomingEvents.map((event) => (
                  <EventSummaryCard key={event._id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            ) : (
              <p className="overview-empty">No upcoming events.</p>
            )}
          </section>

          <section className="overview-section">
            <div className="overview-section-heading">
              <p className="dashboard-card-kicker">Events that happened</p>
              <span>{happenedEvents.length}</span>
            </div>
            {happenedEvents.length > 0 ? (
              <div className="overview-event-grid">
                {happenedEvents.map((event) => (
                  <EventSummaryCard key={event._id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            ) : (
              <p className="overview-empty">No past events yet.</p>
            )}
          </section>
        </>
      )}
      {selectedEvent ? <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} /> : null}
    </section>
  );
}

export default OrganizerDashboardPage;
