import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

const roles = [
  { value: "participant", label: "Participant", description: "Join events and track registrations." },
  { value: "organizer", label: "Organizer", description: "Create events and manage sign-ups." }
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      role: "participant",
      email: "",
      password: ""
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (values) => {
    setSubmitError("");

    try {
      const result = await loginUser(values);
      const fallbackPath =
        result.user.role === "organizer" ? "/organizer" : "/participant";
      const redirectPath = location.state?.from?.pathname || fallbackPath;
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="hero-kicker">Welcome back</p>
          <h1>Sign in to keep your event work moving.</h1>
          <p className="hero-copy auth-copy-text">
            Use the role that matches your account so we can send you to the right workspace.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-role-toggle" role="radiogroup" aria-label="Account type">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`auth-role-option${selectedRole === role.value ? " auth-role-option-active" : ""}`}
              >
                <input type="radio" value={role.value} {...register("role")} />
                <span>{role.label}</span>
                <small>{role.description}</small>
              </label>
            ))}
          </div>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required." })}
            />
            {errors.email ? <small className="auth-error">{errors.email.message}</small> : null}
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password", { required: "Password is required." })}
            />
            {errors.password ? (
              <small className="auth-error">{errors.password.message}</small>
            ) : null}
          </label>

          {submitError ? <p className="auth-error auth-error-banner">{submitError}</p> : null}

          <button type="submit" className="nav-button nav-button-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : `Continue as ${selectedRole}`}
          </button>

          <p className="auth-alt-link">
            Need an account? <Link to="/register">Create one here</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
