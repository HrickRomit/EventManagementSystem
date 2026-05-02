import { useAuth } from "../../context/AuthContext";

function OrganizerDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">Organizer dashboard</p>
        <h2>Organization Name: {user.organizationName || user.name}</h2>
        <p>
          This is the organizer dashboard, where you can manage your events and view registration activity. We are still building out the features for this page, but you can expect to see a list of your events, a pipeline for event drafts, and registration activity in the near future.
        </p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Upcoming events:</p>
        <p>No upcoming events.</p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Attendance</p>
        <p>No registration activity to display.</p>
      </article>
    </section>
  );
}

export default OrganizerDashboardPage;
