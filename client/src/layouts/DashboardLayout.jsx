import { Outlet } from "react-router-dom";
import RoleBadge from "../components/common/RoleBadge";
import { useAuth } from "../context/AuthContext";
import OrganizerSidebar from "../components/navigation/OrganizerSidebar";
import ParticipantSidebar from "../components/navigation/ParticipantSidebar";
import AdminSidebar from "../components/navigation/AdminSidebar";
import Navbar from "../components/navigation/Navbar";

function DashboardLayout() {
  const { user } = useAuth();

  return (
    <main className="dashboard-page">
      <Navbar hideLogout hideActions={user.role === "admin"} />

      <div className="dashboard-shell">
        {user.role === "admin" ? <AdminSidebar /> : user.role === "organizer" ? <OrganizerSidebar /> : <ParticipantSidebar />}

        <section className="dashboard-main">
          <header className="dashboard-topbar">
            <div>
              <p className="dashboard-eyebrow">Signed in as</p>
              <h1>{user.name}</h1>
            </div>

            <div className="dashboard-topbar-actions">
              <RoleBadge role={user.role} />
            </div>
          </header>

          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default DashboardLayout;
