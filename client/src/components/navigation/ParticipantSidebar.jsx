import { NavLink } from "react-router-dom";

const participantLinks = [
  { to: "/participant", label: "Overview", end: true },
  { to: "/participant/profile", label: "Profile" },
  { to: "/participant/registrations", label: "My Registrations" }
];

function ParticipantSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <p className="dashboard-sidebar-kicker">Participant Space</p>
      <nav className="dashboard-sidebar-nav" aria-label="Participant">
        {participantLinks.map((link) => (
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

export default ParticipantSidebar;
