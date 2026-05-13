import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { signInWithGoogle, signUpWithEmail } from "../../auth";
import {
  formatPhoneNumberForOtp,
  getPhoneOtpErrorMessage,
  requestPhoneOtp,
  resetPhoneRecaptcha
} from "../../utils/phoneOtp";

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
  const { registerUser, phoneAuthUser, googleAuthUser } = useAuth();
  const [authMethod, setAuthMethod] = useState("email");
  const [submitError, setSubmitError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
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

  const switchAuthMethod = (method) => {
    setSubmitError("");
    setAuthMethod(method);

    if (method === "email") {
      setOtp("");
      setConfirmationResult(null);
      resetPhoneRecaptcha();
    }
  };

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

      try {
        await signUpWithEmail(values.email, values.password);
      } catch (_firebaseError) {
        // The backend account is the app account; Firebase email auth is optional support.
      }

      navigate(result.user.role === "organizer" ? "/organizer" : "/participant", {
        replace: true
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const handleSendOtp = async () => {
    setSubmitError("");
    setIsOtpSending(true);

    try {
      const formattedPhoneNumber = formatPhoneNumberForOtp(phoneNumber);
      setPhoneNumber(formattedPhoneNumber);
      const result = await requestPhoneOtp(formattedPhoneNumber);
      setConfirmationResult(result);
    } catch (error) {
      resetPhoneRecaptcha();
      setSubmitError(getPhoneOtpErrorMessage(error));
    } finally {
      setIsOtpSending(false);
    }
  };

  const handlePhoneRegister = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const values = watch();

    if (!values.name.trim()) {
      setSubmitError("Name is required.");
      return;
    }

    if (values.role === "organizer" && !values.organizationName.trim()) {
      setSubmitError("Organization name is required for organizers.");
      return;
    }

    if (!confirmationResult) {
      setSubmitError("Please send an OTP first.");
      return;
    }

    setIsPhoneSubmitting(true);

    try {
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();
      const result = await phoneAuthUser({
        idToken,
        mode: "register",
        name: values.name,
        role: values.role,
        organizationName: values.role === "organizer" ? values.organizationName : ""
      });

      navigate(result.user.role === "organizer" ? "/organizer" : "/participant", {
        replace: true
      });
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Phone registration failed. Please try again.");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setSubmitError("");

    const values = watch();

    if (values.role === "organizer" && !values.organizationName.trim()) {
      setSubmitError("Organization name is required for organizers.");
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      const credential = await signInWithGoogle();
      const idToken = await credential.user.getIdToken();
      const result = await googleAuthUser({
        idToken,
        mode: "register",
        name: values.name,
        role: values.role,
        organizationName: values.role === "organizer" ? values.organizationName : ""
      });

      navigate(result.user.role === "organizer" ? "/organizer" : "/participant", {
        replace: true
      });
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Google sign up failed. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
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

        <form className="auth-form" onSubmit={authMethod === "email" ? handleSubmit(onSubmit) : handlePhoneRegister}>
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

          {authMethod === "email" ? (
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required." })}
              />
              {errors.email ? <small className="auth-error">{errors.email.message}</small> : null}
              <button
                type="button"
                className="auth-inline-action"
                onClick={() => switchAuthMethod("phone")}
              >
                Sign up with mobile number instead
              </button>
            </label>
          ) : (
            <>
              <label className="auth-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-inline-action"
                  onClick={() => switchAuthMethod("email")}
                >
                  Sign up with email instead
                </button>
              </label>

              <div id="recaptcha-container" className="auth-recaptcha" />

              <button
                type="button"
                className="nav-button nav-button-secondary auth-submit"
                onClick={handleSendOtp}
                disabled={isOtpSending || !phoneNumber.trim()}
              >
                {isOtpSending ? "Sending OTP..." : confirmationResult ? "Resend OTP" : "Send OTP"}
              </button>

              <label className="auth-field">
                <span>OTP code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  required
                />
              </label>
            </>
          )}

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

          {authMethod === "email" ? (
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
          ) : null}

          {submitError ? <p className="auth-error auth-error-banner">{submitError}</p> : null}

          <button
            type="submit"
            className="nav-button nav-button-primary auth-submit"
            disabled={
              isSubmitting ||
              isPhoneSubmitting ||
              isGoogleSubmitting ||
              (authMethod === "phone" && (!confirmationResult || !otp))
            }
          >
            {authMethod === "phone"
              ? isPhoneSubmitting
                ? "Verifying..."
                : `Create ${selectedRole} account`
              : isSubmitting
                ? "Creating account..."
                : `Create ${selectedRole} account`}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="nav-button nav-button-secondary auth-submit"
            onClick={handleGoogleRegister}
            disabled={isSubmitting || isPhoneSubmitting || isGoogleSubmitting}
          >
            {isGoogleSubmitting ? "Opening Google..." : "Sign up with Gmail"}
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
