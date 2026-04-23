import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, buildFileUrl, publicFetch } from "../config/api";
import AppointmentCalendar from "../components/AppointmentCalendar";
import PrescriptionModal from "../components/PrescriptionModal";
import "./Patientdashboard.css";

function Modal({ children, onClose, maxWidth = "700px" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDateLabel, setCurrentDateLabel] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    bloodGroup: "",
    gender: "",
    address: "",
    allergies: "",
    emergencyContact: "",
  });
  const [appointments, setAppointments] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [testDocuments, setTestDocuments] = useState([]);
  const [prescriptionDocuments, setPrescriptionDocuments] = useState([]);
  const [systemPrescriptions, setSystemPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("test");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  const loadDashboard = async () => {
    const [profile, appointmentList, tests, prescriptions, doctors] = await Promise.all([
      apiFetch("/auth/profile"),
      apiFetch("/appointments/my"),
      apiFetch("/upload/my?category=test"),
      apiFetch("/upload/my?category=prescription"),
      publicFetch("/doctors"),
    ]);

    setProfileData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      dob: profile.dob || "",
      bloodGroup: profile.bloodGroup || "",
      gender: profile.gender || "",
      address: profile.address || "",
      allergies: profile.allergies || "",
      emergencyContact: profile.emergencyContact || "",
    });
    setAppointments(Array.isArray(appointmentList) ? appointmentList : []);
    setTestDocuments(Array.isArray(tests) ? tests : []);
    setPrescriptionDocuments(Array.isArray(prescriptions) ? prescriptions : []);
    setAvailableDoctors(Array.isArray(doctors) ? doctors.slice(0, 4) : []);
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setCurrentDateLabel(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`);
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    update();
    const timer = setInterval(update, 1000);

    loadDashboard().catch((error) => {
      alert(error.message || "Failed to load dashboard data");
    });

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (profileData.name) {
      const allRx = JSON.parse(localStorage.getItem("system_prescriptions") || "[]");
      // Fallback matching logic for ease of demo (assuming mock names like 'Ashya')
      setSystemPrescriptions(allRx.filter(rx => rx.patientName === profileData.name || rx.patientName === "Ashya"));
    }
  }, [profileData.name]);

  const upcomingCount = useMemo(
    () =>
      appointments.filter((appointment) =>
        ["Upcoming", "Pending", "Confirmed"].includes(appointment.status)
      ).length,
    [appointments]
  );
  const completedCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Completed").length,
    [appointments]
  );

  const closeAllModals = () => {
    setShowAllAppointments(false);
    setShowUploadModal(false);
    setShowProfileOverlay(false);
    setFeedbackTarget(null);
    setUploadedFile(null);
    setUploadTitle("");
    setIsEditingProfile(false);
    setFeedbackComment("");
    setFeedbackRating(5);
  };

  const scrollToSection = (id) => {
    if (id === "profile") {
      setActiveNav("profile");
      setShowProfileOverlay(true);
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

  const openUploadModal = (category) => {
    setUploadCategory(category);
    setUploadTitle("");
    setUploadedFile(null);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("category", uploadCategory);
    formData.append("title", uploadTitle || uploadedFile.name);

    try {
      const response = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (uploadCategory === "test") {
        setTestDocuments((current) => [response.document, ...current]);
      } else {
        setPrescriptionDocuments((current) => [response.document, ...current]);
      }

      closeAllModals();
    } catch (error) {
      alert(error.message || "Upload failed");
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      const updatedProfile = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...storedUser, ...updatedProfile })
      );
      setProfileData((current) => ({ ...current, ...updatedProfile }));
      setIsEditingProfile(false);
      alert("Profile updated");
    } catch (error) {
      alert(error.message || "Failed to update profile");
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    try {
      await apiFetch("/auth/update-password", {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      });
      setPasswordForm({ oldPassword: "", newPassword: "" });
      alert("Password updated");
    } catch (error) {
      alert(error.message || "Failed to update password");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackTarget || !feedbackComment.trim()) {
      alert("Please add a comment before submitting.");
      return;
    }

    try {
      await apiFetch(`/appointments/${feedbackTarget._id}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });

      closeAllModals();
      await loadDashboard();
      alert("Feedback submitted successfully");
    } catch (error) {
      alert(error.message || "Failed to submit feedback");
    }
  };

  const navLabels = {
    dashboard: "Dashboard",
    appointments: "Appointments",
    calendar: "Calendar",
    tests: "Test Results",
    prescriptions: "Prescriptions",
    book: "Book Appointment",
    profile: "Profile",
  };

  return (
    <div className="dash-container">
      {selectedPrescription && (
        <PrescriptionModal
          doctor={selectedPrescription.doctor}
          appointment={{}}
          prescriptionData={selectedPrescription.data}
          readOnly={true}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
      {showAllAppointments && (
        <Modal onClose={closeAllModals}>
          <div className="modal-header">
            <h2>All Appointments</h2>
            <button className="modal-close" onClick={closeAllModals}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <strong>{appointment.doctorName}</strong>
                      <small>{appointment.specialty}</small>
                    </td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      {appointment.status}
                      {appointment.status === "Confirmed" && (
                        <div style={confirmedTextStyles}>The appointment is confirmed.</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {showUploadModal && (
        <Modal onClose={closeAllModals} maxWidth="500px">
          <div className="modal-header">
            <h2>
              Upload {uploadCategory === "test" ? "Test Result" : "Prescription"}
            </h2>
            <button className="modal-close" onClick={closeAllModals}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={uploadTitle}
                onChange={(event) => setUploadTitle(event.target.value)}
                placeholder="Enter a document title"
              />
            </div>
            <div
              className="drop-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setUploadedFile(event.dataTransfer.files[0] || null);
              }}
            >
              {uploadedFile ? (
                <p className="drop-zone-filename">{uploadedFile.name}</p>
              ) : (
                <>
                  <p>Drag and drop a file here</p>
                  <p className="drop-zone-sub">or click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setUploadedFile(event.target.files?.[0] || null)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeAllModals}>
                Cancel
              </button>
              <button className="btn-upload" onClick={handleUploadSubmit}>
                Upload
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showProfileOverlay && (
        <Modal onClose={closeAllModals} maxWidth="760px">
          <div className="modal-header">
            <h2>My Profile</h2>
            <div>
              <button
                className="btn-upload-sm"
                style={{ marginRight: "10px" }}
                onClick={() => setIsEditingProfile((value) => !value)}
              >
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
              <button className="modal-close" onClick={closeAllModals}>
                ×
              </button>
            </div>
          </div>
          <div className="modal-body profile-body">
            <div className="profile-avatar-row">
              <div className="profile-avatar-circle">{profileData.name?.[0] || "P"}</div>
              <div>
                <h3 style={{ margin: 0 }}>{profileData.name}</h3>
                <p style={{ margin: "0.2rem 0 0", color: "#777", fontSize: "0.9rem" }}>
                  {profileData.email}
                </p>
              </div>
            </div>

            {!isEditingProfile ? (
              <div className="profile-grid">
                {[
                  ["Full Name", profileData.name],
                  ["Email", profileData.email],
                  ["Phone", profileData.phone],
                  ["Date of Birth", profileData.dob],
                  ["Blood Group", profileData.bloodGroup],
                  ["Gender", profileData.gender],
                  ["Address", profileData.address],
                  ["Allergies", profileData.allergies],
                  ["Emergency Contact", profileData.emergencyContact],
                ].map(([label, value]) => (
                  <div className="profile-field" key={label}>
                    <span className="profile-label">{label}</span>
                    <span className="profile-value">{value || "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleProfileUpdate}
                  className="profile-grid"
                  style={{ marginBottom: "2rem" }}
                >
                  {Object.entries(profileData).map(([key, value]) => (
                    <div className="profile-field" key={key}>
                      <span className="profile-label">{key}</span>
                      <input
                        className="form-input"
                        value={value}
                        disabled={key === "email"}
                        onChange={(event) =>
                          setProfileData((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>

                <hr style={{ borderTop: "1px solid #eee", marginBottom: "1.5rem" }} />
                <h3 style={{ marginBottom: "1rem" }}>Update Password</h3>
                <form
                  onSubmit={handlePasswordUpdate}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Old Password"
                    value={passwordForm.oldPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        oldPassword: event.target.value,
                      }))
                    }
                    required
                  />
                  <input
                    className="form-input"
                    type="password"
                    placeholder="New Password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                    minLength={6}
                    required
                  />
                  <div style={{ textAlign: "right" }}>
                    <button type="submit" className="btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </Modal>
      )}

      {feedbackTarget && (
        <Modal onClose={closeAllModals} maxWidth="500px">
          <div className="modal-header">
            <h2>Leave Feedback</h2>
            <button className="modal-close" onClick={closeAllModals}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Rating</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="5"
                value={feedbackRating}
                onChange={(event) => setFeedbackRating(Number(event.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                className="form-input"
                rows="4"
                value={feedbackComment}
                onChange={(event) => setFeedbackComment(event.target.value)}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <button className="btn-primary" onClick={handleFeedbackSubmit}>
                Submit Feedback
              </button>
            </div>
          </div>
        </Modal>
      )}

      <aside className="dash-sidebar">
        <Link to="/" className="dash-logo">
          WECARE
        </Link>
        <nav className="dash-nav">
          {Object.entries(navLabels).map(([id, label]) => (
            <a
              key={id}
              className={`nav-link ${activeNav === id ? "active" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection(id)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <div className="time-box">
            {currentDateLabel} • {currentTime}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <header id="dashboard" className="dash-header">
          <div className="header-text">
            <h1>Hello, {profileData.name || "Patient"}</h1>
            <p>Your records are loaded from the backend.</p>
          </div>
        </header>

        <div style={summaryGridStyles}>
          {[
            ["Upcoming", upcomingCount],
            ["Completed", completedCount],
            ["Tests", testDocuments.length],
            ["Prescriptions", prescriptionDocuments.length],
          ].map(([label, value]) => (
            <div key={label} className="dash-card">
              <h3>{value}</h3>
              <p style={{ color: "#64748b", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          <div className="dash-left">
            <section id="appointments" className="dash-card">
              <div className="card-title">
                <h3>My Appointments</h3>
                <a
                  className="see-all"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowAllAppointments(true)}
                >
                  See All
                </a>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment._id}>
                      <td>
                        <strong>{appointment.doctorName}</strong>
                        <small>{appointment.specialty}</small>
                      </td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className={`badge ${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                        {appointment.status === "Confirmed" && (
                          <div style={confirmedTextStyles}>The appointment is confirmed.</div>
                        )}
                        {appointment.status === "Completed" && appointment.doctor && (
                          <button
                            className="btn-upload-sm"
                            style={{
                              marginLeft: "8px",
                              background: "#ea580c",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => setFeedbackTarget(appointment)}
                          >
                            Feedback
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan="4">No appointments booked yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section id="calendar" className="dash-card">
              <AppointmentCalendar
                appointments={appointments}
                title="Patient Calendar"
                emptyText="No appointments on this date."
                getPrimaryText={(appointment) => appointment.doctorName || "Doctor"}
                getSecondaryText={(appointment) =>
                  `${appointment.specialty} • ${
                    appointment.type === "online" ? "Video consultation" : "In-person visit"
                  }`
                }
              />
            </section>

            <section id="tests" className="dash-card">
              <div className="card-title">
                <h3>Test Results</h3>
                <button className="btn-upload" onClick={() => openUploadModal("test")}>
                  Upload Result
                </button>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Uploaded</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testDocuments.map((document) => (
                    <tr key={document._id}>
                      <td>{document.title}</td>
                      <td>{new Date(document.createdAt).toLocaleDateString()}</td>
                      <td>
                        <a
                          className="btn-download"
                          href={buildFileUrl(document.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                  {testDocuments.length === 0 && (
                    <tr>
                      <td colSpan="3">No test documents uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section id="prescriptions" className="dash-card">
              <div className="card-title">
                <h3>Prescriptions</h3>
                <button className="btn-upload" onClick={() => openUploadModal("prescription")}>
                  Upload
                </button>
              </div>
              <div className="rx-list">
                {prescriptionDocuments.map((document) => (
                  <div key={document._id} className="rx-item">
                    <div className="rx-info">
                      <strong>{document.title}</strong>
                      <small>
                        Uploaded on {new Date(document.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <a
                      className="btn-download"
                      href={buildFileUrl(document.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </div>
                ))}
                {systemPrescriptions.map((rx) => (
                  <div key={rx._id} className="rx-item" style={{ background: "#f0f9ff", borderLeft: "4px solid #0ea5e9" }}>
                    <div className="rx-info">
                      <strong>Prescription from {rx.doctor?.name ? (rx.doctor.name.startsWith("Dr.") ? rx.doctor.name : "Dr. " + rx.doctor.name) : "Doctor"}</strong>
                      <small>
                        Created on {new Date(rx.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      className="btn-download"
                      onClick={() => setSelectedPrescription(rx)}
                      style={{ background: "#0ea5e9" }}
                    >
                      View
                    </button>
                  </div>
                ))}
                {(prescriptionDocuments.length === 0 && systemPrescriptions.length === 0) && (
                  <p style={{ color: "#888", margin: 0 }}>No prescriptions uploaded or generated yet.</p>
                )}
              </div>
            </section>

            <section id="book" className="dash-card">
              <div className="card-title">
                <h3>Book Appointment</h3>
              </div>
              <p style={{ color: "#64748b" }}>
                Choose from live doctor data and book through the backend flow.
              </p>
              <button
                className="btn-primary"
                style={{ padding: "10px 20px", borderRadius: "8px", border: "none" }}
                onClick={() => navigate("/booking")}
              >
                Open Booking Form
              </button>
            </section>
          </div>

          <div className="dash-right">
            <section className="dash-card">
              <h3>Profile Snapshot</h3>
              <div className="profile-grid" style={{ gridTemplateColumns: "1fr" }}>
                {[
                  ["Phone", profileData.phone],
                  ["Blood Group", profileData.bloodGroup],
                  ["Address", profileData.address],
                ].map(([label, value]) => (
                  <div key={label} className="profile-field">
                    <span className="profile-label">{label}</span>
                    <span className="profile-value">{value || "—"}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-upload"
                style={{ marginTop: "1rem" }}
                onClick={() => scrollToSection("profile")}
              >
                View Full Profile
              </button>
            </section>

            <section className="dash-card video-card">
              <h3>Available Doctors</h3>
              <div className="doctor-list">
                {availableDoctors.map((doctor) => (
                  <div key={doctor._id} className="doctor-item">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        doctor.name
                      )}&background=E0F2FE&color=075985`}
                      alt={doctor.name}
                    />
                    <div className="doctor-info">
                      <strong>{doctor.name}</strong>
                      <small>{doctor.specialty}</small>
                    </div>
                    <span
                      className={`status-dot ${doctor.isAvailable ? "online" : "offline"}`}
                    ></span>
                  </div>
                ))}
              </div>
              <button className="btn-schedule" onClick={() => navigate("/doctors")}>
                Explore Doctors
              </button>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(7px);
        }

        .modal-box {
          background: #fff;
          border-radius: 16px;
          width: 90%;
          max-height: 82vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .modal-body {
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
        }

        .drop-zone {
          border: 2px dashed #c8d6e5;
          border-radius: 12px;
          padding: 2rem 1rem;
          text-align: center;
          cursor: pointer;
          background: #f8faff;
          margin-bottom: 1.25rem;
        }

        .drop-zone-sub {
          color: #888;
          font-size: 0.85rem;
        }

        .drop-zone-filename {
          font-weight: 600;
          color: #2d6a4f;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 0.55rem 1.25rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
        }

        .profile-body {
          padding: 1.5rem;
        }

        .profile-avatar-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .profile-avatar-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7c59, #2d6a4f);
          color: #fff;
          font-size: 1.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          background: #f8faff;
          border-radius: 10px;
          padding: 0.75rem 1rem;
        }

        .profile-label {
          font-size: 0.72rem;
          color: #999;
          text-transform: uppercase;
        }

        .profile-value {
          font-size: 0.93rem;
          color: #1a1a2e;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

const summaryGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const confirmedTextStyles = {
  marginTop: "6px",
  color: "#16a34a",
  fontSize: "12px",
  fontWeight: 700,
};
