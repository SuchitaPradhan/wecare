import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import AppointmentCalendar from "../components/AppointmentCalendar";
import PrescriptionModal from "../components/PrescriptionModal";
import "./DoctorDashboard.css";

function Modal({ children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function ProfileModal({ doctor, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: doctor.name || "",
    phone: doctor.phone || "",
    specialty: doctor.specialty || "",
    qualification: doctor.qualification || "",
    experience: doctor.experience || 0,
    hospital: doctor.hospital || "",
    city: doctor.city || "",
    shifts: doctor.shifts || "",
    languages: Array.isArray(doctor.languages) ? doctor.languages.join(", ") : "",
    isAvailable: doctor.isAvailable ?? true,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const updatedDoctor = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          experience: Number(formData.experience) || 0,
          languages: formData.languages
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });
      onSave(updatedDoctor);
      onClose();
    } catch (error) {
      alert(error.message || "Failed to update profile");
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>Doctor Profile</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {[
          ["name", "Name"],
          ["phone", "Phone"],
          ["specialty", "Specialty"],
          ["qualification", "Qualification"],
          ["experience", "Experience"],
          ["hospital", "Hospital"],
          ["city", "City"],
          ["shifts", "Shifts"],
          ["languages", "Languages (comma separated)"],
        ].map(([key, label]) => (
          <label key={key} style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
            <input
              className="form-input"
              value={formData[key]}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
          </label>
        ))}

        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={formData.isAvailable}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                isAvailable: event.target.checked,
              }))
            }
          />
          Currently available for appointments
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" style={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" style={styles.primaryButton}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [dashboard, setDashboard] = useState({
    doctor: { name: "Doctor" },
    stats: {
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      followUpPatients: 0,
      totalRevenue: 0,
      pendingRevenue: 0,
    },
    upcomingAppointments: [],
    followUpPatients: [],
    paymentHistory: [],
    recentFeedback: [],
  });
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedPrescriptionApt, setSelectedPrescriptionApt] = useState(null);

  const loadDashboard = async () => {
    try {
      const data = await apiFetch("/doctors/dashboard");
      setDashboard(data);
    } catch (error) {
      alert(error.message || "Failed to load doctor dashboard");
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    if (id === "profile") {
      setShowProfile(true);
      setActiveNav(id);
      return;
    }

    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const response = await apiFetch(`/appointments/${appointmentId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      alert(response.message || "Appointment updated successfully.");
      await loadDashboard();
    } catch (error) {
      alert(error.message || "Failed to update appointment");
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "follow-up", label: "Follow-Up Patients" },
    { id: "appointments", label: "Upcoming Appointments" },
    { id: "calendar", label: "Calendar" },
    { id: "payment", label: "Payment" },
    { id: "reviews", label: "Reviews" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="dashboard">
      {showProfile && (
        <ProfileModal
          doctor={dashboard.doctor}
          onClose={() => {
            setShowProfile(false);
            setActiveNav("dashboard");
          }}
          onSave={(doctor) =>
            setDashboard((current) => ({ ...current, doctor }))
          }
        />
      )}
      {selectedPrescriptionApt && (
        <PrescriptionModal
          doctor={dashboard.doctor}
          appointment={selectedPrescriptionApt}
          onClose={() => setSelectedPrescriptionApt(null)}
        />
      )}

      <aside className="sidebar" style={{ padding: 0, paddingBottom: "24px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <Link to="/" style={{ 
            fontSize: "22px", 
            fontWeight: "800", 
            color: "#2563eb", 
            textDecoration: "none", 
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "18px" }}>←</span> WECARE
          </Link>
        </div>
        <div style={{ textAlign: "center", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={styles.avatarLarge}>{dashboard.doctor.name?.[0] || "D"}</div>
          <h3 style={{ margin: "12px 0 4px", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
            {dashboard.doctor.name?.startsWith("Dr.") ? dashboard.doctor.name : (dashboard.doctor.name ? "Dr. " + dashboard.doctor.name : "Doctor")}
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{dashboard.doctor.specialty || "Specialist"}</p>
        </div>

        <ul className="nav" style={{ padding: "12px 16px", flex: 1 }}>
          {navItems.map((item) => (
            <li
              key={item.id}
              className={activeNav === item.id ? "active" : ""}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </li>
          ))}
          <li className="logout" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </aside>

      <main className="main">
        <div id="dashboard">
          <div className="topbar">
            <h2>Dashboard</h2>
            <div style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "10px 22px",
              fontSize: "22px",
              fontWeight: "700",
              color: "#1e293b",
              letterSpacing: "1px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              minWidth: "140px",
              textAlign: "center"
            }}>
              {currentTime}
            </div>
          </div>

          <p style={{ marginBottom: 24, color: "#64748b" }}>
            You have <b>{dashboard.stats.upcomingAppointments}</b> active appointments,
            <b> {dashboard.stats.followUpPatients}</b> follow-up patients, and
            <b> ₹{dashboard.stats.totalRevenue.toLocaleString()}</b> collected revenue.
          </p>

          <div className="stats">
            <div className="stat">
              <span>Total Appointments</span>
              <h3>{dashboard.stats.totalAppointments}</h3>
              <small className="badge">All time</small>
            </div>
            <div className="stat">
              <span>Upcoming</span>
              <h3>{dashboard.stats.upcomingAppointments}</h3>
              <small className="badge">Active</small>
            </div>
            <div className="stat">
              <span>Completed</span>
              <h3>{dashboard.stats.completedAppointments}</h3>
              <small className="badge">Closed</small>
            </div>
            <div className="stat">
              <span>Pending Revenue</span>
              <h3>₹{dashboard.stats.pendingRevenue.toLocaleString()}</h3>
              <small className="badge">To collect</small>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", marginBottom: 28 }}>
            <div id="follow-up" className="card" style={{ minHeight: 420 }}>
              <h4>Follow-Up Patients</h4>
              {dashboard.followUpPatients.map((patient) => (
                <div key={patient.id} className="patient-row" style={styles.listItem}>
                  <div style={styles.avatar}>{patient.name?.[0] || "P"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.title}>{patient.name}</div>
                    <div style={styles.subtitle}>
                      {patient.specialty} • Last visit: {patient.lastVisit || "—"}
                    </div>
                    <div style={styles.subtitle}>
                      {patient.phone || "No phone"} • {patient.email || "No email"}
                    </div>
                  </div>
                  <span style={{
                    ...styles.badge,
                    ...(patient.status === "Completed" ? { background: "#dcfce7", color: "#15803d" } :
                       patient.status === "Confirmed" ? { background: "#dbeafe", color: "#1d4ed8" } :
                       patient.status === "Cancelled" ? { background: "#fee2e2", color: "#b91c1c" } :
                       patient.status === "Upcoming" ? { background: "#fef9c3", color: "#92400e" } :
                       patient.status === "Pending" ? { background: "#fef3c7", color: "#b45309" } :
                       { background: "#f1f5f9", color: "#475569" })
                  }}>{patient.status}</span>
                  {patient.status === "Confirmed" && (
                    <button
                      style={{ ...styles.secondaryButton, padding: "4px 10px", fontSize: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "5px" }}
                      onClick={() => setSelectedPrescriptionApt({ patientName: patient.name, date: new Date().toISOString().split("T")[0] })}
                    >
                      📝 Prescribe
                    </button>
                  )}
                </div>
              ))}
              {dashboard.followUpPatients.length === 0 && (
                <p style={{ color: "#94a3b8" }}>No follow-up patients yet.</p>
              )}
            </div>

            <div className="card" style={{ minHeight: 420 }}>
              <h4>Profile Snapshot</h4>
              <div style={styles.sideList}>
                {[
                  ["Specialty", dashboard.doctor.specialty],
                  ["Hospital", dashboard.doctor.hospital],
                  ["City", dashboard.doctor.city],
                  ["Availability", dashboard.doctor.isAvailable ? "Available" : "Busy"],
                ].map(([label, value]) => (
                  <div key={label} style={styles.sideListItem}>
                    <small>{label}</small>
                    <strong>{value || "—"}</strong>
                  </div>
                ))}
              </div>
              <button style={styles.primaryButton} onClick={() => setShowProfile(true)}>
                Edit Profile
              </button>
            </div>
          </div>

          <div id="appointments" className="card" style={{ marginBottom: 28 }}>
            <h4>Upcoming Appointments</h4>
            {dashboard.upcomingAppointments.map((appointment) => {
              const isConfirmed = appointment.status === "Confirmed";
              return (
                <div key={appointment._id} className="apt-row" style={styles.listItem}>
                  <div style={styles.avatar}>{appointment.patientName?.[0] || "P"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                      <div style={styles.title}>{appointment.patientName}</div>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        ...(appointment.status === "Completed" ? { background: "#dcfce7", color: "#15803d" } :
                           appointment.status === "Confirmed" ? { background: "#dbeafe", color: "#1d4ed8" } :
                           appointment.status === "Cancelled" ? { background: "#fee2e2", color: "#b91c1c" } :
                           appointment.status === "Upcoming" ? { background: "#fef9c3", color: "#92400e" } :
                           { background: "#f1f5f9", color: "#475569" })
                      }}>{appointment.status}</span>
                    </div>
                    <div style={styles.subtitle}>
                      {appointment.specialty} • {appointment.date} at {appointment.time}
                    </div>
                    <div style={styles.subtitle}>
                      {appointment.type === "online"
                        ? `Video consultation • Payment ${appointment.paymentStatus}`
                        : `In-person visit • Payment ${appointment.paymentStatus}`}
                    </div>
                    <div style={styles.subtitle}>{appointment.notes || "No notes added."}</div>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {appointment.status === "Confirmed" && (
                      <button
                        style={{ ...styles.primaryButton, background: "#0ea5e9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                        onClick={() => setSelectedPrescriptionApt(appointment)}
                      >
                        📝 Prescribe
                      </button>
                    )}
                    {!isConfirmed ? (
                      <button
                        style={styles.primaryButton}
                        onClick={() => handleStatusUpdate(appointment._id, "Confirmed")}
                      >
                        Confirm
                      </button>
                    ) : null}
                    <button
                      style={styles.secondaryButton}
                      onClick={() => handleStatusUpdate(appointment._id, "Completed")}
                    >
                      Complete
                    </button>
                    <button
                      style={styles.dangerButton}
                      onClick={() => handleStatusUpdate(appointment._id, "Cancelled")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
            {dashboard.upcomingAppointments.length === 0 && (
              <p style={{ color: "#94a3b8" }}>No upcoming appointments.</p>
            )}
          </div>
        </div>

        <div id="calendar" className="card" style={{ marginBottom: 28 }}>
          <AppointmentCalendar
            appointments={dashboard.upcomingAppointments}
            title="Doctor Calendar"
            emptyText="No doctor appointments on this date."
            getPrimaryText={(appointment) => appointment.patientName || "Patient"}
            getSecondaryText={(appointment) =>
              `${appointment.specialty} • ${
                appointment.type === "online" ? "Video consultation" : "In-person visit"
              }`
            }
          />
        </div>

        <div id="payment" className="card" style={{ marginBottom: 28 }}>
          <h4>Payment History</h4>
          <div style={styles.summaryGrid}>
            {[
              ["Collected", `₹${dashboard.stats.totalRevenue.toLocaleString()}`],
              ["Pending", `₹${dashboard.stats.pendingRevenue.toLocaleString()}`],
              ["Invoices", dashboard.paymentHistory.length],
            ].map(([label, value]) => (
              <div key={label} style={styles.summaryCard}>
                <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Patient", "Date", "Service", "Amount", "Status"].map((header) => (
                  <th key={header} style={styles.tableHeader}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboard.paymentHistory.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={styles.tableCell}>{payment.patientName}</td>
                  <td style={styles.tableCell}>{payment.date}</td>
                  <td style={styles.tableCell}>{payment.service}</td>
                  <td style={styles.tableCell}>₹{payment.amount.toLocaleString()}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      ...(payment.status === "Paid"
                        ? { background: "#dcfce7", color: "#15803d" }
                        : payment.status === "Pending"
                        ? { background: "#fef9c3", color: "#92400e" }
                        : payment.status === "Refunded"
                        ? { background: "#dbeafe", color: "#1d4ed8" }
                        : { background: "#fee2e2", color: "#b91c1c" })
                    }}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {dashboard.paymentHistory.length === 0 && (
                <tr>
                  <td colSpan="5" style={styles.tableCell}>
                    No payment history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div id="reviews" className="card">
          <h4>Recent Feedback</h4>
          {dashboard.recentFeedback.map((feedback) => (
            <div key={feedback._id} style={styles.reviewCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{feedback.patient?.name || "Patient"}</strong>
                <span style={styles.badge}>Rating: {feedback.rating}/5</span>
              </div>
              <p style={{ marginBottom: 0, color: "#475569" }}>{feedback.comment}</p>
            </div>
          ))}
          {dashboard.recentFeedback.length === 0 && (
            <p style={{ color: "#94a3b8" }}>No feedback submitted yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 32px 80px rgba(15,23,42,0.2)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: "pointer",
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    margin: "0 auto 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    color: "#fff",
    fontWeight: 700,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 12px",
    borderRadius: 14,
    marginBottom: 10,
    border: "1px solid #f1f5f9",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#e0e7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#2563eb",
    flexShrink: 0,
  },
  title: {
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  badge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  primaryButton: {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "8px 14px",
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  dangerButton: {
    padding: "8px 14px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    background: "#f8fafc",
    borderRadius: 14,
    padding: "16px 18px",
  },
  tableHeader: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    padding: "12px",
    color: "#475569",
  },
  reviewCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sideList: {
    display: "grid",
    gap: 12,
    marginBottom: 20,
  },
  sideListItem: {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    background: "#f8fafc",
  },
};

export default DoctorDashboard;
