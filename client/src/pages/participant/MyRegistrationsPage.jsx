import { useEffect, useState } from "react";
import { getMyRegistrations } from "../../services/events";

function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRegistrations()
      .then(({ data }) => setRegistrations(data.registrations))
      .catch(() => setError("Could not load your registrations."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">My registrations</p>
        <h2>{registrations.length > 0 ? "Your confirmed bookings." : "No event registrations yet."}</h2>
        <p>Booked events and ticket status appear here after checkout.</p>
      </article>

      {isLoading ? <p className="overview-empty">Loading registrations...</p> : null}
      {error ? <p className="alert alert-error">{error}</p> : null}

      {!isLoading && !error && registrations.length > 0 ? (
        <div className="registration-list">
          {registrations.map((registration) => (
            <article key={registration._id} className="registration-card">
              <div>
                <p className="dashboard-card-kicker">{registration.status}</p>
                <h3>{registration.eventName}</h3>
                <p>{registration.organizerName}</p>
              </div>
              <dl>
                <div>
                  <dt>Date</dt>
                  <dd>{new Date(registration.eventDate).toLocaleDateString()} at {registration.eventTime}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{registration.venue}</dd>
                </div>
                <div>
                  <dt>Access</dt>
                  <dd>
                    {registration.entryType === "tickets"
                      ? `${registration.ticketCategory} ticket - BDT ${registration.price}`
                      : "Registration"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default MyRegistrationsPage;
