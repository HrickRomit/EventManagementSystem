import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-kicker">Admin Panel</div>
      <nav className="dashboard-sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "dashboard-sidebar-link dashboard-sidebar-link-active"
              : "dashboard-sidebar-link"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? "dashboard-sidebar-link dashboard-sidebar-link-active"
              : "dashboard-sidebar-link"
          }
        >
          Manage Users
        </NavLink>
        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            isActive
              ? "dashboard-sidebar-link dashboard-sidebar-link-active"
              : "dashboard-sidebar-link"
          }
        >
          Active Events
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
