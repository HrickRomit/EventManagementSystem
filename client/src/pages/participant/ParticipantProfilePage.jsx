import { useAuth } from "../../context/AuthContext";

function ParticipantProfilePage() {
  const { user } = useAuth();

  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">Participant profile</p>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-card-kicker">What we stored</p>
        <h3>Account details</h3>
        <p>Role: participant</p>
        <p>Profile editing can land here in the next step.</p>
      </article>
    </section>
  );
}

export default ParticipantProfilePage;
