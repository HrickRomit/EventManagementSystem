import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../images/logo.png";

function Navbar({ hideLogout = false }) {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const dashboardPath =
    user?.role === "admin" ? "/admin" : user?.role === "organizer" ? "/organizer" : "/participant";
  const dashboardLabel =
    user?.role === "admin" ? "Admin Panel" : user?.role === "organizer" ? "Organizer Hub" : "My Dashboard";

  return (
    <header className="home-header">
      <Link className="brand-mark" to="/">
        <img className="brand-logo" src={logo} alt="Eventsphere" />
      </Link>

      <nav className="home-nav" aria-label="Primary">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/how-it-works">How It Works</NavLink>
      </nav>

      <div className="home-actions">
        {isAuthenticated ? (
          <>
            <Link
              className="nav-button nav-button-secondary"
              to={dashboardPath}
            >
              {dashboardLabel}
            </Link>
            {!hideLogout ? (
              <button
                type="button"
                className="nav-button nav-button-primary nav-button-plain"
                onClick={logoutUser}
              >
                Log Out
              </button>
            ) : null}
          </>
        ) : (
          <>
            <Link className="nav-button nav-button-secondary" to="/login">
              Log In
            </Link>
            <Link className="nav-button nav-button-primary" to="/register">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
