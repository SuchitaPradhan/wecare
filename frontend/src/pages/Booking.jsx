import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch, API_BASE } from "../config/api";

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    doctor: location.state?.doctorId || "", // Doctor ID
    doctorName: location.state?.doctor || "",
    specialty: location.state?.specialty || "",
    date: "",
    time: "",
    type: "offline",
    notes: ""
  });
  const [doctorsList, setDoctorsList] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/doctors`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctorsList(data);
        }
      })
      .catch(console.error);
  }, []);

  const specialties = ["Cardiology", "Neurology", "Dermatology", "Orthopedics", "General Medicine"];
  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (token) {
        // Save to database via API
        await apiFetch("/appointments", {
          method: "POST",
          body: JSON.stringify({
            doctor: booking.doctor || null,
            doctorName: booking.doctorName || "Any Available Doctor",
            specialty: booking.specialty,
            date: booking.date,
            time: booking.time,
            type: booking.type,
            notes: booking.notes,
          }),
        });
      } else {
        // Fallback: save to localStorage for guests
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        existingAppointments.push({
          id: Date.now(),
          patientName: currentUser.name || "Guest",
          patientEmail: currentUser.email || "guest@example.com",
          doctor: booking.doctorName || "Any Available Doctor",
          specialty: booking.specialty,
          date: booking.date,
          time: booking.time,
          status: "Upcoming",
          type: booking.type,
          notes: booking.notes,
        });
        localStorage.setItem('appointments', JSON.stringify(existingAppointments));
      }

      alert("Appointment booked successfully!");
      navigate("/Patientdashboard");
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: "520px" }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">WECARE</Link>
          <h1 className="auth-title">Book Appointment</h1>
          <p className="auth-subtitle">Step {step} of 3</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Select Doctor (Optional)</label>
                <select
                  className="form-input"
                  value={booking.doctor}
                  onChange={(e) => {
                    const selDoc = doctorsList.find(d => d._id === e.target.value || d.id === e.target.value);
                    setBooking({ ...booking, doctor: e.target.value, doctorName: selDoc ? selDoc.name : "" });
                  }}
                >
                  <option value="">Any Available Doctor</option>
                  {doctorsList.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name} ({d.specialty})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Specialty</label>
                <select
                  className="form-input"
                  value={booking.specialty}
                  onChange={(e) => setBooking({ ...booking, specialty: e.target.value })}
                  required
                >
                  <option value="">Choose specialty...</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <select
                  className="form-input"
                  value={booking.type}
                  onChange={(e) => setBooking({ ...booking, type: e.target.value })}
                >
                  <option value="offline">In-Person Visit</option>
                  <option value="online">Video Consultation</option>
                </select>
              </div>

              <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Time Slot</label>
                <select
                  className="form-input"
                  value={booking.time}
                  onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                  required
                >
                  <option value="">Choose time...</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Describe your symptoms or concerns..."
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                />
              </div>

              <div style={{ background: "var(--color-bg-cream)", padding: "1rem", borderRadius: "12px", marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Appointment Summary</p>
                {booking.doctorName && <p style={{ marginBottom: "0.25rem" }}><strong>Doctor:</strong> {booking.doctorName}</p>}
                <p><strong>{booking.specialty || "General"}</strong> • {booking.type === "online" ? "Video Call" : "In-Person"}</p>
                <p>{booking.date} at {booking.time}</p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary btn-lg">
                  Confirm Booking
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-link">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
