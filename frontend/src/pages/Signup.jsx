import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicFetch } from "../config/api";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "patient"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(formData.email)) {
      alert("Invalid Email Format");
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      alert("Invalid Phone Number (10 digits required)");
      return;
    }

    try {
      await publicFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      alert("You have registered successfully");
      navigate("/signin");
    } catch (error) {
      alert(error.message || "Registration failed");
    }
  };

  return (
    <div className="auth-split">
      {/* Left branding panel */}
      <div className="auth-split-left">
        <div className="auth-brand-logo">WECARE</div>
        <p className="auth-brand-tagline">Join thousands of patients and doctors on one trusted platform.</p>
        <div className="auth-brand-features">
          {[
            "Book verified specialists",
            "Manage appointments easily",
            "Upload & track records",
            "Secure & private always",
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join WECARE and take control of your health</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder=""
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder=""
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder=""
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am a</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
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
            </div>

            <button type="submit" className="btn btn-primary btn-lg">Create Account →</button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
