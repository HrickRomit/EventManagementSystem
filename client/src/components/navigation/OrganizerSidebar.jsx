import { NavLink } from "react-router-dom";

const organizerLinks = [
  { to: "/organizer", label: "Overview", end: true },
  { to: "/organizer/events", label: "Manage Events", end: true },
  { to: "/organizer/events/new", label: "Create Event" }
];

function OrganizerSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <p className="dashboard-sidebar-kicker">Organizer Studio</p>
      <nav className="dashboard-sidebar-nav" aria-label="Organizer">
        {organizerLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `dashboard-sidebar-link${isActive ? " dashboard-sidebar-link-active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default OrganizerSidebar;
