import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AuthRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="auth-status-shell">Checking your session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === "organizer" ? "/organizer" : "/participant"} replace />;
  }

  return <Outlet />;
}

export default AuthRedirect;
