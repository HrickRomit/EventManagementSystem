import { useEffect, useState } from "react";
import { getAdminEvents } from "../../services/api";

function ActiveEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminEvents()
      .then(({ data }) => setEvents(data.events))
      .catch(() => setError("Could not load active events."))
      .finally(() => setLoading(false));
  }, []);

  const getTicketsLeft = (event) => {
    if (event.entryType !== "tickets" || !event.ticket?.categories?.length) {
      return null;
    }

    return event.ticket.categories.reduce((total, category) => total + Number(category.available || 0), 0);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h2>Active Events</h2>
          <p className="admin-dashboard-copy">
            Review published events that are currently visible to participants.
          </p>
        </div>
        <span className="admin-count-pill">{events.length} active</span>
      </div>

      {loading ? <p className="overview-empty">Loading active events...</p> : null}
      {error ? <p className="alert alert-error">{error}</p> : null}

      {!loading && !error && events.length === 0 ? (
        <p className="overview-empty">No active events found.</p>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <div className="admin-event-list">
          {events.map((event) => {
            const ticketsLeft = getTicketsLeft(event);

            return (
              <article key={event._id} className="admin-event-row">
                <div className="admin-event-main">
                  {event.eventImage ? (
                    <img src={event.eventImage} alt={event.name} />
                  ) : (
                    <div className="admin-event-image-empty" />
                  )}
                  <div>
                    <p className="dashboard-card-kicker">{event.eventType}</p>
                    <h3>{event.name}</h3>
                    <p>{event.organizerName}</p>
                  </div>
                </div>

                <dl className="admin-event-meta">
                  <div>
                    <dt>Date</dt>
                    <dd>{new Date(event.date).toLocaleDateString()} at {event.time}</dd>
                  </div>
                  <div>
                    <dt>Venue</dt>
                    <dd>{event.venue}</dd>
                  </div>
                  <div>
                    <dt>Seats Left</dt>
                    <dd>{event.capacity}</dd>
                  </div>
                  <div>
                    <dt>Access</dt>
                    <dd>
                      {event.entryType === "tickets" && ticketsLeft !== null
                        ? `${ticketsLeft} tickets left`
                        : event.entryType}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default ActiveEventsPage;
