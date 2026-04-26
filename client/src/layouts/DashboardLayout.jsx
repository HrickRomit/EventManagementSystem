import { Outlet } from "react-router-dom";
import RoleBadge from "../components/common/RoleBadge";
import { useAuth } from "../context/AuthContext";
import OrganizerSidebar from "../components/navigation/OrganizerSidebar";
import ParticipantSidebar from "../components/navigation/ParticipantSidebar";

function DashboardLayout() {
  const { user, logoutUser } = useAuth();

  return (
    <main className="dashboard-shell">
      {user.role === "organizer" ? <OrganizerSidebar /> : <ParticipantSidebar />}

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">Signed in as</p>
            <h1>{user.name}</h1>
          </div>

          <div className="dashboard-topbar-actions">
            <RoleBadge role={user.role} />
            <button
              type="button"
              className="nav-button nav-button-secondary nav-button-plain"
              onClick={logoutUser}
            >
              Log Out
            </button>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  );
}

export default DashboardLayout;
