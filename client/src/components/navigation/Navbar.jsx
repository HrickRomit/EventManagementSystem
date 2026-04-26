import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logoutUser } = useAuth();

  return (
    <header className="home-header">
      <Link className="brand-mark" to="/">
        EventSphere
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
              to={user.role === "organizer" ? "/organizer" : "/participant"}
            >
              {user.role === "organizer" ? "Organizer Hub" : "My Dashboard"}
            </Link>
            <button
              type="button"
              className="nav-button nav-button-primary nav-button-plain"
              onClick={logoutUser}
            >
              Log Out
            </button>
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
