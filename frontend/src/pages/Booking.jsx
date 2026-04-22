import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch, publicFetch } from "../config/api";

const CONSULTATION_FEES = {
  offline: 700,
  online: 1200,
};

function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const hourNumber = Number(hours);
  const suffix = hourNumber >= 12 ? "PM" : "AM";
  const normalizedHour = hourNumber % 12 || 12;
  return `${normalizedHour}:${minutes} ${suffix}`;
}

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [booking, setBooking] = useState({
    doctor: location.state?.doctorId || "",
    doctorName: location.state?.doctor || "",
    specialty: location.state?.specialty || "",
    hospital: location.state?.hospital || "",
    date: "",
    time: "",
    type: "offline",
    notes: "",
  });
  const [payment, setPayment] = useState({
    payerName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    publicFetch("/doctors")
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setDoctors([]);
      });
  }, []);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === booking.doctor),
    [booking.doctor, doctors]
  );

  const specialties = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))].sort(),
    [doctors]
  );

  useEffect(() => {
    if (!selectedDoctor) return;
    setBooking((current) => ({
      ...current,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty || current.specialty,
      hospital: selectedDoctor.hospital || "",
    }));
  }, [selectedDoctor]);

  const totalSteps = booking.type === "online" ? 4 : 3;
  const consultationFee = CONSULTATION_FEES[booking.type] || CONSULTATION_FEES.offline;

  const canContinueStepOne =
    booking.specialty && booking.type && (booking.doctor ? booking.doctorName : true);
  const canContinueStepTwo = booking.date && booking.time;
  const canSubmitOnline = true;

  const createAppointment = async (payload) => {
    const response = await apiFetch("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setIsCompleted(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        doctor: booking.doctor || null,
        specialty: booking.specialty,
        date: booking.date,
        time: formatTime(booking.time),
        type: booking.type,
        notes: booking.notes,
        hospital: booking.hospital,
        fee: consultationFee,
        status: booking.type === "online" ? "Confirmed" : "Upcoming",
        paymentStatus: booking.type === "online" ? "Paid" : "Pending",
        paymentMethod: booking.type === "online" ? "Card" : "In Person",
        paymentReference:
          booking.type === "online" ? `TXN-${Date.now().toString().slice(-8)}` : "",
      };

      await createAppointment(payload);
    } catch (error) {
      alert(error.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: "560px" }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            WECARE
          </Link>
          <h1 className="auth-title">Book Appointment</h1>
          <p className="auth-subtitle">
            Step {step} of {totalSteps}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {step === 1 && !isCompleted && (
            <>
              <div className="form-group">
                <label className="form-label">Select Doctor (Optional)</label>
                <select
                  className="form-input"
                  value={booking.doctor}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      doctor: event.target.value,
                    }))
                  }
                >
                  <option value="">Any Available Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Specialty</label>
                <select
                  className="form-input"
                  value={booking.specialty}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      specialty: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Choose specialty...</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <select
                  className="form-input"
                  value={booking.type}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="offline">In-Person Visit</option>
                  <option value="online">Video Consultation</option>
                </select>
              </div>

              {selectedDoctor?.hospital && (
                <div style={summaryCardStyles}>
                  <strong>{selectedDoctor.name}</strong>
                  <p style={{ margin: "0.35rem 0 0" }}>
                    {selectedDoctor.hospital}
                    {selectedDoctor.city ? `, ${selectedDoctor.city}` : ""}
                  </p>
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setStep(2)}
                disabled={!canContinueStepOne}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && !isCompleted && (
            <>
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={booking.date}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={booking.time}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      time: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => setStep(3)}
                  disabled={!canContinueStepTwo}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && !isCompleted && (
            <>
              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Describe your symptoms or concerns..."
                  value={booking.notes}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>

              <div style={summaryCardStyles}>
                <p style={summaryLabelStyles}>Appointment Summary</p>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>Doctor:</strong> {booking.doctorName || "Any Available Doctor"}
                </p>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>Specialty:</strong> {booking.specialty}
                </p>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>Type:</strong>{" "}
                  {booking.type === "online" ? "Video Consultation" : "In-Person"}
                </p>
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>Schedule:</strong> {booking.date} at {formatTime(booking.time)}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>Fee:</strong> ₹{consultationFee}
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                {booking.type === "online" ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => setStep(4)}
                  >
                    Continue to Payment
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? "Booking..." : "Confirm Booking"}
                  </button>
                )}
              </div>
            </>
          )}

          {step === 4 && booking.type === "online" && !isCompleted && (
            <>
              <div style={summaryCardStyles}>
                <p style={summaryLabelStyles}>Payment Summary</p>
                <p style={{ margin: 0 }}>
                  Video consultation payment to be charged now: <strong>₹{consultationFee}</strong>
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => setStep(3)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Pay ₹${consultationFee} & Book`}
                </button>
              </div>
            </>
          )}

          {isCompleted && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <h2 style={{ color: "#16a34a", marginBottom: "1rem" }}>
                {booking.type === "online" ? "Payment Completed!" : "Booking Successful!"}
              </h2>
              <p style={{ marginBottom: "2rem", color: "#475569", fontSize: "1.1rem" }}>
                Your appointment has been successfully confirmed.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/Patientdashboard")}
                style={{ width: "100%" }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </form>

        {!isCompleted && (
          <p className="auth-link">
            <Link to="/">← Back to Home</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const summaryCardStyles = {
  background: "var(--color-bg-cream)",
  padding: "1rem",
  borderRadius: "12px",
  marginBottom: "1rem",
};

const summaryLabelStyles = {
  fontSize: "0.875rem",
  color: "var(--color-text-muted)",
  marginBottom: "0.5rem",
};
