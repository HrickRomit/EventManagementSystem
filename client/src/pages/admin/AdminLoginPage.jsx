import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loginAdminUser } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (values) => {
    setSubmitError("");

    try {
      await loginAdminUser(values);
      navigate(location.pathname || "/admin", { replace: true });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Admin login failed. Please try again.");
    }
  };

  return (
    <section className="admin-login-shell">
      <form className="admin-login-panel" onSubmit={handleSubmit(onSubmit)}>
        <div className="admin-login-heading">
          <p>EventSphere Admin</p>
          <h1>Admin Login</h1>
        </div>

        {isAuthenticated && user.role !== "admin" ? (
          <p className="admin-login-note">
            You are signed in as {user.role}. Enter admin credentials to continue.
          </p>
        ) : null}

        <label className="auth-field">
          <span>Username</span>
          <input
            type="text"
            autoComplete="username"
            placeholder="admin"
            {...register("username", { required: "Username is required." })}
          />
          {errors.username ? <small className="auth-error">{errors.username.message}</small> : null}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Admin password"
            {...register("password", { required: "Password is required." })}
          />
          {errors.password ? <small className="auth-error">{errors.password.message}</small> : null}
        </label>

        {submitError ? <p className="auth-error auth-error-banner">{submitError}</p> : null}

        <button type="submit" className="nav-button nav-button-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Log In"}
        </button>
      </form>
    </section>
  );
}

export default AdminLoginPage;
