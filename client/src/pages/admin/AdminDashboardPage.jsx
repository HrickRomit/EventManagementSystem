import { useEffect, useState } from "react";
import { getAdminUsers } from "../../services/api";

function AdminDashboardPage() {
  const [stats, setStats] = useState({ total: 0, participants: 0, organizers: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const { data: allUsers } = await getAdminUsers();
        const { data: participants } = await getAdminUsers("participant");
        const { data: organizers } = await getAdminUsers("organizer");
        const { data: admins } = await getAdminUsers("admin");

        setStats({
          total: allUsers.total,
          participants: participants.total,
          organizers: organizers.total,
          admins: admins.total
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="admin-dashboard">Loading stats...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="admin-dashboard-copy">
            Use this page to review user counts and quickly navigate to user management.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Participants</h3>
          <p className="stat-value">{stats.participants}</p>
        </div>
        <div className="stat-card">
          <h3>Organizers</h3>
          <p className="stat-value">{stats.organizers}</p>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <p className="stat-value">{stats.admins}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
