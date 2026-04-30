import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleHomePaths = {
  admin: "/admin",
  organizer: "/organizer",
  participant: "/participant"
};

function AuthRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="auth-status-shell">Checking your session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={roleHomePaths[user.role] || "/participant"} replace />;
  }

  return <Outlet />;
}

export default AuthRedirect;
