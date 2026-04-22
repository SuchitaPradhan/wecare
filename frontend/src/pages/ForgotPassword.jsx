import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicFetch } from "../config/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await publicFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      alert(data.message);
      setStep(2);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      alert("Password reset successfully. Please login.");
      navigate("/signin");
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-split">
      {/* Left branding panel */}
      <div className="auth-split-left">
        <div className="auth-brand-logo">WECARE</div>
        <p className="auth-brand-tagline">Secure password recovery for your account.</p>
        <div className="auth-brand-features">
          {[
            "OTP sent to your email",
            "Secure 5-minute expiry",
            "Single-use verification",
            "Instant account recovery",
          ].map((f) => (
            <div key={f} className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-split-right">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/signin" className="auth-logo">← Back to Sign In</Link>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              {step === 1
                ? "Enter your email to receive an OTP"
                : "Enter the OTP sent to " + email}
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                height: "4px",
                flex: 1,
                borderRadius: "99px",
                background: step >= s ? "#7ea4be" : "#e8ebf3",
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? "Sending…" : "Send OTP →"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength="6"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? "Resetting…" : "Reset Password →"}
              </button>
            </form>
          )}

          <p className="auth-link">
            Remembered it? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
