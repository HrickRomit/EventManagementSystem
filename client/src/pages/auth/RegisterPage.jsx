import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

const roles = [
  {
    value: "participant",
    label: "Participant",
    description: "Discover events, register quickly, and manage your bookings."
  },
  {
    value: "organizer",
    label: "Organizer",
    description: "Launch events, manage attendance, and coordinate operations."
  }
];

function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      role: "participant",
      name: "",
      email: "",
      password: "",
      organizationName: ""
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (values) => {
    setSubmitError("");

    try {
      const payload =
        values.role === "organizer"
          ? values
          : {
              name: values.name,
              email: values.email,
              password: values.password,
              role: values.role
            };
      const result = await registerUser(payload);
      navigate(result.user.role === "organizer" ? "/organizer" : "/participant", {
        replace: true
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="hero-kicker">Create your account</p>
          <h1>Start as a participant or organizer today.</h1>
          <p className="hero-copy auth-copy-text">
            We’ll use this account for the first stage of the platform, then we can extend the same system for admin later.
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
            <span>Full name</span>
            <input
              type="text"
              placeholder="Your name"
              {...register("name", { required: "Name is required." })}
            />
            {errors.name ? <small className="auth-error">{errors.name.message}</small> : null}
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required." })}
            />
            {errors.email ? <small className="auth-error">{errors.email.message}</small> : null}
          </label>

          {selectedRole === "organizer" ? (
            <label className="auth-field">
              <span>Organization name</span>
              <input
                type="text"
                placeholder="Your event brand or company"
                {...register("organizationName", {
                  required: "Organization name is required for organizers."
                })}
              />
              {errors.organizationName ? (
                <small className="auth-error">{errors.organizationName.message}</small>
              ) : null}
            </label>
          ) : null}

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="At least 6 characters"
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters."
                }
              })}
            />
            {errors.password ? (
              <small className="auth-error">{errors.password.message}</small>
            ) : null}
          </label>

          {submitError ? <p className="auth-error auth-error-banner">{submitError}</p> : null}

          <button type="submit" className="nav-button nav-button-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : `Create ${selectedRole} account`}
          </button>

          <p className="auth-alt-link">
            Already registered? <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;
