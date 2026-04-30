import { Outlet } from "react-router-dom";
import AdminLoginPage from "../../pages/admin/AdminLoginPage";
import { useAuth } from "../../context/AuthContext";

function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="auth-status-shell">Checking admin session...</div>;
  }

  if (!isAuthenticated || user.role !== "admin") {
    return <AdminLoginPage />;
  }

  return <Outlet />;
}

export default AdminRoute;
