import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleHomePaths = {
  admin: "/admin",
  organizer: "/organizer",
  participant: "/participant"
};

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="auth-status-shell">Checking your session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePaths[user.role] || "/participant"} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
