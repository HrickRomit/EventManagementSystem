import { useAuth } from "../../context/AuthContext";

function OrganizerDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">Organizer dashboard</p>
        <h2>{user.organizationName || user.name}</h2>
        <p>
          Your organizer workspace is ready. Next we can connect event creation,
          participant registrations, approval workflows, and sales reporting.
        </p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Pipeline</p>
        <h3>Draft events</h3>
        <p>This area is set up for event drafts once we add the event model and CRUD routes.</p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">Attendance</p>
        <h3>Registration activity</h3>
        <p>Participant sign-ups will surface here after we build the registration records.</p>
      </article>
    </section>
  );
}

export default OrganizerDashboardPage;
