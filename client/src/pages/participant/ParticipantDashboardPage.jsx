import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRegistrations } from "../../services/events";

function ParticipantDashboardPage() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRegistrations()
      .then(({ data }) => setRegistrations(data.registrations))
      .catch(() => setError("Could not load your dashboard."))
      .finally(() => setIsLoading(false));
  }, []);

  const upcomingRegistrations = useMemo(() => {
    const now = new Date();

    return registrations
      .filter((registration) => new Date(registration.eventDate) >= now)
      .sort((first, second) => new Date(first.eventDate) - new Date(second.eventDate))
      .slice(0, 3);
  }, [registrations]);

  const checkedInCount = registrations.filter(
    (registration) => registration.attendanceStatus === "checked_in"
  ).length;
  const pendingCheckInCount = registrations.length - checkedInCount;

  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">Participant dashboard</p>
        <h2>{registrations.length > 0 ? "Your bookings are ready." : "Find your next event."}</h2>
        <p>Upcoming tickets, recent registrations, and attendance status now update from your real bookings.</p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Tickets</p>
        <h3>{registrations.length} registration{registrations.length === 1 ? "" : "s"}</h3>
        <p>{pendingCheckInCount} waiting for check-in, {checkedInCount} already checked in.</p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Next event</p>
        <h3>{upcomingRegistrations[0]?.eventName || "Nothing upcoming yet"}</h3>
        <p>
          {upcomingRegistrations[0]
            ? `${new Date(upcomingRegistrations[0].eventDate).toLocaleDateString()} at ${upcomingRegistrations[0].eventTime}`
            : "Browse active events and register when something catches your eye."}
        </p>
      </article>

      {error ? <p className="alert alert-error">{error}</p> : null}
      {isLoading ? <p className="overview-empty">Loading dashboard...</p> : null}

      {!isLoading ? (
        <article className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-row">
            <div>
              <p className="dashboard-card-kicker">Upcoming tickets</p>
              <h3>Ready for entry</h3>
            </div>
            <Link className="nav-button nav-button-secondary" to="/participant/registrations">
              View all
            </Link>
          </div>
          {upcomingRegistrations.length > 0 ? (
            <div className="dashboard-ticket-list">
              {upcomingRegistrations.map((registration) => (
                <div key={registration._id} className="dashboard-ticket-row">
                  <div>
                    <strong>{registration.eventName}</strong>
                    <p>{registration.venue}</p>
                  </div>
                  <span>{registration.attendanceStatus === "checked_in" ? "Checked in" : "Not checked in"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="overview-empty">No upcoming registrations yet.</p>
          )}
        </article>
      ) : null}
    </section>
  );
}

export default ParticipantDashboardPage;
