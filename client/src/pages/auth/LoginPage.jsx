import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import {
  signInWithGoogle,
  loginWithEmail
} from "../../auth";
import {
  formatPhoneNumberForOtp,
  getPhoneOtpErrorMessage,
  requestPhoneOtp,
  resetPhoneRecaptcha
} from "../../utils/phoneOtp";

const roles = [
  { value: "participant", label: "Participant", description: "Join events and track registrations." },
  { value: "organizer", label: "Organizer", description: "Create events and manage sign-ups." }
];

const roleHomePaths = {
  organizer: "/organizer",
  participant: "/participant"
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, phoneAuthUser, googleAuthUser } = useAuth();
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
      email: "",
      password: ""
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (values) => {
    setSubmitError("");

    try {
      try {
        await loginWithEmail(values.email, values.password);
      } catch (_firebaseError) {
        // MongoDB is the app's source of truth; older accounts may not exist in Firebase.
      }

      const result = await loginUser(values);
      const fallbackPath = roleHomePaths[result.user.role] || "/participant";
      const redirectPath = location.state?.from?.pathname || fallbackPath;
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const goToRoleHome = (result) => {
    const fallbackPath = roleHomePaths[result.user.role] || "/participant";
    const redirectPath = location.state?.from?.pathname || fallbackPath;
    navigate(redirectPath, { replace: true });
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

  const handlePhoneLogin = async (event) => {
    event.preventDefault();
    setSubmitError("");

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
        role: selectedRole,
        mode: "login"
      });

      goToRoleHome(result);
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Phone login failed. Please try again.");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitError("");
    setIsGoogleSubmitting(true);

    try {
      const credential = await signInWithGoogle();
      const idToken = await credential.user.getIdToken();
      const result = await googleAuthUser({
        idToken,
        role: selectedRole,
        mode: "login"
      });

      goToRoleHome(result);
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Google sign in failed. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
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

        <form className="auth-form" onSubmit={authMethod === "email" ? handleSubmit(onSubmit) : handlePhoneLogin}>
          <div className="auth-method-toggle" aria-label="Sign in method">
            <button
              type="button"
              className={authMethod === "email" ? "auth-method-active" : ""}
              onClick={() => setAuthMethod("email")}
            >
              Email
            </button>
            <button
              type="button"
              className={authMethod === "phone" ? "auth-method-active" : ""}
              onClick={() => setAuthMethod("phone")}
            >
              Phone
            </button>
          </div>

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

          {authMethod === "email" ? (
            <>
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
            </>
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

          {submitError ? <p className="auth-error auth-error-banner">{submitError}</p> : null}

          <button
            type="submit"
            className="nav-button nav-button-primary auth-submit"
            disabled={isSubmitting || isPhoneSubmitting || isGoogleSubmitting}
          >
            {authMethod === "phone"
              ? isPhoneSubmitting
                ? "Verifying..."
                : `Continue as ${selectedRole}`
              : isSubmitting
                ? "Signing in..."
                : `Continue as ${selectedRole}`}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="nav-button nav-button-secondary auth-submit"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isPhoneSubmitting || isGoogleSubmitting}
          >
            {isGoogleSubmitting ? "Opening Google..." : "Continue with Gmail"}
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
