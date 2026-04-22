import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicFetch } from "../config/api";

export default function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await publicFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      if (data.user.role === "admin") navigate("/AdminDashboard");
      else if (data.user.role === "doctor") navigate("/DoctorDashboard");
      else navigate("/Patientdashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left branding panel */}
      <div className="auth-split-left">
        <div className="auth-brand-logo">WECARE</div>
        <p className="auth-brand-tagline">Your Health, Our Priority.</p>
        <div className="auth-brand-features">
          {[
            "Verified doctor profiles",
            "Instant appointment booking",
            "Secure medical records",
            "Real-time dashboards",
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
            <Link to="/" className="auth-logo">← WECARE</Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to manage your healthcare</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                marginBottom: "16px",
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <div style={{ textAlign: "right", marginTop: "6px" }}>
                <Link to="/forgot-password" style={{ fontSize: "13px", color: "#7ea4be" }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <p className="auth-link">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
