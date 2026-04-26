function ParticipantDashboardPage() {
  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">Participant dashboard</p>
        <h2>Your event journey starts here.</h2>
        <p>
          This is the base workspace for participants. Next we can connect event browsing,
          registration checkout, ticket history, and profile preferences.
        </p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Next build</p>
        <h3>Upcoming registrations</h3>
        <p>Hook this into the event registration collection once we build the booking flow.</p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Profile health</p>
        <h3>Account readiness</h3>
        <p>Your saved profile details will feed into faster event sign-up later.</p>
      </article>
    </section>
  );
}

export default ParticipantDashboardPage;
