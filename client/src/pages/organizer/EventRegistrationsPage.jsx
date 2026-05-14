import { useEffect, useMemo, useState } from "react";
import { getOrganizerEventRegistrations, getOrganizerEvents } from "../../services/events";

function EventRegistrationsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrganizerEvents()
      .then(({ data }) => {
        setEvents(data.events);
        setSelectedEventId(data.events[0]?._id || "");
      })
      .catch(() => setError("Could not load your events."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setRegistrations([]);
      setSelectedEvent(null);
      setTicketStats(null);
      return;
    }

    setIsLoading(true);
    setError("");

    getOrganizerEventRegistrations(selectedEventId)
      .then(({ data }) => {
        setSelectedEvent(data.event);
        setRegistrations(data.registrations);
        setTicketStats(data.stats || null);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "Could not load registrations.");
        setRegistrations([]);
        setTicketStats(null);
      })
      .finally(() => setIsLoading(false));
  }, [selectedEventId]);

  const totals = useMemo(
    () => ({
      registered: ticketStats?.totalTickets ?? registrations.length,
      checkedIn:
        ticketStats?.checkedInTickets ??
        registrations.filter((registration) => registration.attendanceStatus === "checked_in").length,
      paid: ticketStats?.paidTickets ?? registrations.filter((registration) => registration.paymentStatus === "paid").length
    }),
    [registrations, ticketStats]
  );

  return (
    <section className="event-workspace">
      <div className="event-workspace-header">
        <div>
          <p className="dashboard-card-kicker">Organizer Studio</p>
          <h2>Event Registrations</h2>
          <p className="manage-users-copy">Review attendees, payment status, and check-in progress for each event.</p>
        </div>
        <label className="form-group organizer-event-picker">
          <span>Event</span>
          <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {selectedEvent ? (
        <div className="stats-grid registration-stats-grid">
          <article className="stat-card">
            <h3>Total tickets</h3>
            <p className="stat-value">{totals.registered}</p>
          </article>
          <article className="stat-card">
            <h3>Tickets checked in</h3>
            <p className="stat-value">{totals.checkedIn}</p>
          </article>
          <article className="stat-card">
            <h3>Paid tickets</h3>
            <p className="stat-value">{totals.paid}</p>
          </article>
        </div>
      ) : null}

      {isLoading ? (
        <p className="loading-message">Loading registrations...</p>
      ) : registrations.length === 0 ? (
        <p className="no-users-message">No registrations for this event yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Ticket</th>
                <th>Payment</th>
                <th>Registered</th>
                <th>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration._id}>
                  <td>
                    <strong>{registration.participant?.name || "Participant"}</strong>
                    <p>{registration.participant?.email || registration.participant?.phoneNumber || "-"}</p>
                  </td>
                  <td>
                    {registration.entryType === "tickets"
                      ? `${registration.ticketCategory} - BDT ${registration.price}`
                      : "Registration"}
                    <p className="registration-ticket-id">{registration.ticketId}</p>
                  </td>
                  <td>{registration.paymentStatus === "not_required" ? "Not required" : registration.paymentStatus}</td>
                  <td>{new Date(registration.createdAt).toLocaleString()}</td>
                  <td>
                    {registration.attendanceStatus === "checked_in"
                      ? `Checked in ${new Date(registration.checkedInAt).toLocaleString()}`
                      : "Not checked in"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default EventRegistrationsPage;
