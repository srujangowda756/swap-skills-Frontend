import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { api } from "../services/api";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const requestCode = async () => {
    setError("");
    setMessage("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return false;
    }

    setLoading(true);
    try {
      const result = await api.forgetPassword({ email: email.trim() });
      setMessage(
        result?.message ||
          "If the account exists and is verified, a password reset code was sent.",
      );
      setStage("reset");
      return true;
    } catch (requestError) {
      setError(requestError.message || "Could not request a reset code.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    await requestCode();
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.setNewPassword({
        email: email.trim(),
        otp,
        password,
        confirm_password: confirmPassword,
      });
      navigate("/login", {
        replace: true,
        state: { message: "Password updated. Sign in with your new password." },
      });
    } catch (resetError) {
      setError(resetError.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-logo-glow auth-badge">
              {stage === "request" ? (
                <Mail size={22} className="brand-icon" />
              ) : (
                <KeyRound size={22} className="brand-icon" />
              )}
            </div>
            <h1 className="auth-title">
              {stage === "request"
                ? "Reset your password"
                : "Choose a new password"}
            </h1>
            <p className="auth-subtitle">
              {stage === "request"
                ? "Enter your account email and we’ll send you a reset code."
                : `Enter the 6-digit code sent to ${email.trim()}.`}
            </p>
          </div>

          {message && (
            <div className="alert-banner alert-success" role="status">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert-banner alert-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {stage === "request" ? (
            <form onSubmit={handleRequestCode} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reset-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              className="auth-form"
              noValidate
            >
              <div className="form-group">
                <label htmlFor="reset-otp">Verification Code</label>
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  disabled={loading}
                  autoComplete="one-time-code"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-password">New Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reset-password"
                    type="password"
                    className="form-input"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reset-confirm-password">
                  Confirm New Password
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className="form-input"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Set new password</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={requestCode}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Mail size={18} />
                )}
                <span>Resend reset code</span>
              </button>
            </form>
          )}

          <div className="auth-footer">
            {stage === "reset" && (
              <p>
                Wrong email?{" "}
                <button
                  type="button"
                  className="auth-link auth-link-button"
                  onClick={() => {
                    setStage("request");
                    setError("");
                    setMessage("");
                  }}
                >
                  Change it
                </button>
              </p>
            )}
            <p>
              <Link to="/login" className="auth-link">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
