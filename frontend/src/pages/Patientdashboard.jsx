import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import "./Patientdashboard.css";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDateLabel, setCurrentDateLabel] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeNav, setActiveNav] = useState("dashboard");
  const [userName, setUserName] = useState("Patient");

  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalType, setUploadModalType] = useState("");
  const [uploadModalTestName, setUploadModalTestName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const fileInputRef = useRef(null);

  const [testsRequested, setTestsRequested] = useState([
    { id: 1, name: "Blood Test (CBC)", doctor: "Dr. Rahul Mehta", date: "Feb 12, 2026", status: "Pending", file: null },
    { id: 2, name: "X-Ray Chest", doctor: "Dr. Samantha", date: "Feb 8, 2026", status: "Completed", file: null },
    { id: 3, name: "ECG", doctor: "Dr. Ananya Rao", date: "Feb 14, 2026", status: "Pending", file: null }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: "General Medicine", doctor: "Dr. Rahul Mehta", date: "Feb 5, 2026", file: null },
    { id: 2, name: "Blood Pressure Medication", doctor: "Dr. Samantha", date: "Jan 28, 2026", file: null }
  ]);

  const [uploadTargetTestId, setUploadTargetTestId] = useState(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAppointmentId, setFeedbackAppointmentId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // ── Live date + time ──
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      setCurrentDateLabel(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`);
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") closeAllModals(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const closeAllModals = () => {
    setShowAllAppointments(false);
    setShowUploadModal(false);
    setShowProfileOverlay(false);
    setShowFeedbackModal(false);
    setUploadedFile(null);
    setUploadSuccess(false);
  };

  const scrollToSection = (id) => {
    if (id === "profile") {
      setActiveNav("profile");
      setShowProfileOverlay(true);
      return;
    }
    setActiveNav(id);
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [appointments, setAppointments] = useState([
    { id: 1, doctor: "Dr. Rahul Mehta", specialty: "Cardiologist", date: "Feb 10, 2026", time: "10:30 AM", status: "Upcoming" },
    { id: 2, doctor: "Dr. Ananya Rao", specialty: "Dermatologist", date: "Jan 25, 2026", time: "04:00 PM", status: "Completed" },
    { id: 3, doctor: "Dr. Samantha", specialty: "Neurologist", date: "Feb 15, 2026", time: "11:00 AM", status: "Scheduled" },
  ]);

  const [availableDoctors, setAvailableDoctors] = useState([
    { name: "Dr. Samantha", specialty: "Cardiologist", avatar: "https://i.pravatar.cc/100?img=26", available: true },
    { name: "Dr. Rahul Mehta", specialty: "Neurologist", avatar: "https://i.pravatar.cc/100?img=12", available: true },
    { name: "Dr. Ananya Rao", specialty: "Dermatologist", avatar: "https://i.pravatar.cc/100?img=45", available: false }
  ]);

  const [apiDoctors, setApiDoctors] = useState([]);

  const [profileData, setProfileData] = useState({
    name: "Patient", email: "", phone: "",
    dob: "", bloodGroup: "", gender: "",
    address: "", allergies: "None",
    emergencyContact: ""
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify(profileData) });
      alert("Profile updated!");
      setIsEditingProfile(false);
    } catch (err) { alert(err.message); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/update-password", { method: "PUT", body: JSON.stringify(passwordForm) });
      alert("Password updated!");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) { alert(err.message); }
  };

  // Fetch profile + appointments from API on mount
  useEffect(() => {
    // Fetch doctors for booking form
    fetch("http://localhost:5000/api/doctors")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setApiDoctors(data); })
      .catch(console.error);

    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch profile
    apiFetch("/auth/profile")
      .then((data) => {
        setUserName(data.name || "Patient");
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          dob: data.dob || "",
          bloodGroup: data.bloodGroup || "",
          gender: data.gender || "",
          address: data.address || "",
          allergies: data.allergies || "None",
          emergencyContact: data.emergencyContact || "",
        });
      })
      .catch(() => {
        const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
        setUserName(stored.name || "Patient");
      });

    // Fetch appointments
    apiFetch("/appointments/my")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((a) => ({
            id: a._id,
            doctor: a.doctorName || "Doctor",
            specialty: a.specialty,
            date: a.date,
            time: a.time,
            status: a.status,
          }));
          setAppointments(mapped);
        }
      })
      .catch(() => console.log("Using fallback appointments"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate("/");
  };

  // ── Real Download ──
  const handleDownload = (itemName, file) => {
    if (file && file instanceof File) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Demo items: generate a text blob as PDF placeholder
      const content = `WECARE Medical Document\n\nDocument: ${itemName}\nGenerated: ${new Date().toLocaleString()}\nPatient: Suchita\n\nThis is a sample document generated by WECARE.`;
      const blob = new Blob([content], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${itemName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const openUploadModal = (type, testName = "", testId = null) => {
    setUploadModalType(type);
    setUploadModalTestName(testName);
    setUploadTargetTestId(testId);
    setUploadedFile(null);
    setUploadSuccess(false);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) setUploadedFile(f); };
  const handleFileDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f); };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) { alert("Please select a file first."); return; }
    
    // POST to /api/upload
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Successfully uploaded! Update UI states based on API return if needed
      // (Using dummy logic for now to show visual success)
      if (uploadModalType === "test" && uploadTargetTestId) {
        setTestsRequested(prev => prev.map(t => t.id === uploadTargetTestId ? { ...t, status: "Completed", file: uploadedFile } : t));
      } else if (uploadModalType === "test") {
        setTestsRequested(prev => [...prev, {
          id: Date.now(), name: "Uploaded Result", doctor: "Self-uploaded",
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: "Completed", file: uploadedFile
        }]);
      } else if (uploadModalType === "prescription") {
        setPrescriptions(prev => [...prev, {
          id: Date.now(), name: uploadedFile.name.replace(/\.[^/.]+$/, ""),
          doctor: "Self-uploaded",
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          file: uploadedFile
        }]);
      }
      setUploadSuccess(true);
    } catch (error) {
      alert("Upload failed: " + error.message);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackComment) return alert("Please leave a comment.");
    try {
      await apiFetch(`/appointments/${feedbackAppointmentId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment }),
      });
      alert("Feedback submitted successfully!");
      setShowFeedbackModal(false);
      setFeedbackAppointmentId(null);
      setFeedbackComment("");
      setFeedbackRating(5);
    } catch (err) {
      alert("Failed to submit feedback: " + err.message);
    }
  };

  const handleVideoCall = (doctor) => alert(`Initiating video call with ${doctor.name}...`);

  // Calendar
  const getDaysInMonth = (date) => ({
    daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    startingDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  });

  const isAppointmentDate = (day) => appointmentDates.find(apt =>
    apt.date.getDate() === day && apt.date.getMonth() === currentMonth.getMonth() && apt.date.getFullYear() === currentMonth.getFullYear()
  );

  const getAppointmentsForDate = (day) => appointmentDates.filter(apt =>
    apt.date.getDate() === day && apt.date.getMonth() === currentMonth.getMonth() && apt.date.getFullYear() === currentMonth.getFullYear()
  );

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const now = new Date();
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(<div key={`e-${i}`} className="calendar-day empty"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
      const hasAppt = isAppointmentDate(day);
      const isToday = day === now.getDate() && currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear();
      days.push(
        <div key={day} className={`calendar-day ${hasAppt ? 'has-appointment' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => { const a = getAppointmentsForDate(day); if (a.length) alert(`Appointments on ${day}:\n${a.map(x => `${x.doctor} - ${x.time}`).join('\n')}`); }}>
          {day}
          {hasAppt && <span className="appointment-dot"></span>}
        </div>
      );
    }
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="calendar-weekdays">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div className="calendar-grid">{days}</div>
      </div>
    );
  };

  const appointmentDates = appointments.map((a) => {
    const parts = a.date.split("-");
    return {
      date: parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(),
      doctor: a.doctor,
      time: a.time,
    };
  });

  const navLabels = {
    dashboard: "Dashboard", appointments: "Appointments", book: "Book Appointment", tests: "Test Results",
    prescriptions: "Prescriptions", messages: "Messages", profile: "Profile"
  };

  return (
    <div className="dash-container">

      {/* ── See All Modal ── */}
      {showAllAppointments && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Appointments</h2>
              <button className="modal-close" onClick={closeAllModals}>✕</button>
            </div>
            <div className="modal-body">
              <table className="dash-table">
                <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td><strong>{apt.doctor}</strong><small>{apt.specialty}</small></td>
                      <td>{apt.date}</td><td>{apt.time}</td>
                      <td>
                        <span className={`badge ${apt.status.toLowerCase()}`} title={`Status: ${apt.status}`}>{apt.status}</span>
                        {apt.status === "Completed" && (
                          <button className="btn-upload-sm" style={{marginLeft:"8px", background:"#ea580c", color:"#fff", border:"none"}} onClick={() => { setFeedbackAppointmentId(apt.id); setShowFeedbackModal(true); }}>Feedback</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-box upload-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{uploadModalType === "prescription" ? "Upload Prescription" : `Upload${uploadModalTestName ? `: ${uploadModalTestName}` : " Test Result"}`}</h2>
              <button className="modal-close" onClick={closeAllModals}>✕</button>
            </div>
            <div className="modal-body">
              {uploadSuccess ? (
                <div className="upload-success">
                  <div className="success-icon">✓</div>
                  <h3>Uploaded Successfully!</h3>
                  <p><strong>{uploadedFile?.name}</strong> has been uploaded.</p>
                  <button className="btn-upload" style={{ marginTop: "1rem" }} onClick={closeAllModals}>Done</button>
                </div>
              ) : (
                <>
                  <div className="drop-zone" onDragOver={e => e.preventDefault()} onDrop={handleFileDrop} onClick={() => fileInputRef.current?.click()}>
                    <div className="drop-zone-icon">📂</div>
                    {uploadedFile
                      ? <p className="drop-zone-filename">📄 {uploadedFile.name}</p>
                      : <><p>Drag & drop your file here</p><p className="drop-zone-sub">or <span className="link-text">browse files</span></p><p className="drop-zone-hint">Supported: PDF, JPG, PNG (max 10MB)</p></>
                    }
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={handleFileChange} />
                  </div>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeAllModals}>Cancel</button>
                    <button className="btn-upload" onClick={handleUploadSubmit} disabled={!uploadedFile}
                      style={{ opacity: uploadedFile ? 1 : 0.5, cursor: uploadedFile ? "pointer" : "not-allowed" }}>Upload</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Overlay ── */}
      {showProfileOverlay && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-box profile-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>My Profile</h2>
              <div>
                <button className="btn-upload-sm" style={{marginRight: "10px"}} onClick={() => setIsEditingProfile(!isEditingProfile)}>
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </button>
                <button className="modal-close" onClick={closeAllModals}>✕</button>
              </div>
            </div>
            <div className="modal-body profile-body">
              <div className="profile-avatar-row">
                <div className="profile-avatar-circle">{profileData.name?.[0] || 'P'}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{profileData.name}</h3>
                  <p style={{ margin: "0.2rem 0 0", color: "#777", fontSize: "0.9rem" }}>{profileData.email}</p>
                </div>
              </div>
              
              {!isEditingProfile ? (
                <>
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
                  <div style={{ textAlign: "right", marginTop: "1.25rem" }}>
                    <button className="btn-upload" onClick={closeAllModals}>Close</button>
                  </div>
                </>
              ) : (
                <>
                  <form onSubmit={handleProfileUpdate} className="profile-grid" style={{marginBottom: "2rem"}}>
                    {Object.keys(profileData).map((key) => (
                      <div className="profile-field" key={key}>
                        <span className="profile-label">{key.toUpperCase()}</span>
                        <input className="form-input" style={{padding: "5px", fontSize: "0.9rem", border: "1px solid #ccc", borderRadius: "5px"}} value={profileData[key]} onChange={e => setProfileData({...profileData, [key]: e.target.value})} disabled={key === "email"} />
                      </div>
                    ))}
                    <div style={{gridColumn: "1 / -1", textAlign: "right"}}>
                      <button type="submit" className="btn-primary" style={{padding: "10px 20px", borderRadius: "8px", border: "none"}}>Save Changes</button>
                    </div>
                  </form>
                  
                  <hr style={{borderTop: "1px solid #eee", marginBottom: "1.5rem"}}/>
                  <h3 style={{marginBottom: "1rem"}}>Update Password</h3>
                  <form onSubmit={handlePasswordUpdate} style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                    <input className="form-input" style={{padding: "10px", border: "1px solid #ccc", borderRadius: "5px"}} type="password" placeholder="Old Password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} required />
                    <input className="form-input" style={{padding: "10px", border: "1px solid #ccc", borderRadius: "5px"}} type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength={6} />
                    <div style={{textAlign: "right"}}>
                      <button type="submit" className="btn-primary" style={{padding: "10px 20px", borderRadius: "8px", border: "none"}}>Update Password</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback Modal ── */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-box upload-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Leave Feedback</h2>
              <button className="modal-close" onClick={closeAllModals}>✕</button>
            </div>
            <div className="modal-body" style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              <div>
                <label style={{fontWeight: 600, display: "block", marginBottom: "5px"}}>Rating (1-5):</label>
                <input type="number" min="1" max="5" value={feedbackRating} onChange={e => setFeedbackRating(Number(e.target.value))} style={{width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc"}} />
              </div>
              <div>
                <label style={{fontWeight: 600, display: "block", marginBottom: "5px"}}>Comment:</label>
                <textarea rows="4" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} style={{width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc"}}></textarea>
              </div>
              <div style={{textAlign: "right", marginTop: "10px"}}>
                <button type="button" className="btn-primary" style={{padding: "10px 20px", borderRadius: "8px", border: "none"}} onClick={handleFeedbackSubmit}>Submit Feedback</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <Link to="/" className="dash-logo">WECARE</Link>
        <nav className="dash-nav">
          {Object.entries(navLabels).map(([id, label]) => (
            <a key={id} className={`nav-link ${activeNav === id ? "active" : ""}`}
              style={{ cursor: "pointer" }} onClick={() => scrollToSection(id)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          {/* ✅ Live date & time */}
          <div className="time-box">{currentDateLabel} • {currentTime}</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <header id="dashboard" className="dash-header">
          <div className="header-text">
            <h1>Hello, {userName}</h1>
            <p>Your health dashboard</p>
          </div>
          <div className="header-profile"><img src="" alt={userName} /></div>
        </header>

        <div className="dash-grid">
          <div className="dash-left">

            {/* Appointments */}
            <section id="appointments" className="dash-card">
              <div className="card-title">
                <h3>My Appointments</h3>
                <a className="see-all" style={{ cursor: "pointer" }} onClick={() => setShowAllAppointments(true)}>See All</a>
              </div>
              <table className="dash-table">
                <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.slice(0, 3).map(apt => (
                    <tr key={apt.id}>
                      <td><strong>{apt.doctor}</strong><small>{apt.specialty}</small></td>
                      <td>{apt.date}</td><td>{apt.time}</td>
                      <td>
                        <span className={`badge ${apt.status.toLowerCase()}`} title={`Status: ${apt.status}`}>{apt.status}</span>
                        {apt.status === "Completed" && (
                          <button className="btn-upload-sm" style={{marginLeft:"8px", background:"#ea580c", color:"#fff", border:"none"}} onClick={() => { setFeedbackAppointmentId(apt.id); setShowFeedbackModal(true); }}>Feedback</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Tests */}
            <section id="tests" className="dash-card">
              <div className="card-title">
                <h3>Tests Requested by Doctors</h3>
                <button className="btn-upload" onClick={() => openUploadModal("test")}>Upload Result</button>
              </div>
              <table className="dash-table">
                <thead><tr><th>Test Name</th><th>Doctor</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {testsRequested.map(test => (
                    <tr key={test.id}>
                      <td>{test.name}</td><td>{test.doctor}</td><td>{test.date}</td>
                      <td><span className={`badge ${test.status.toLowerCase()}`}>{test.status}</span></td>
                      <td>
                        {test.status === 'Completed'
                          ? <button className="btn-download" onClick={() => handleDownload(test.name, test.file)}>Download</button>
                          : <button className="btn-upload-sm" onClick={() => openUploadModal("test", test.name, test.id)}>Upload</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Prescriptions */}
            <section id="prescriptions" className="dash-card">
              <div className="card-title">
                <h3>Prescriptions</h3>
                <button className="btn-upload" onClick={() => openUploadModal("prescription")}>Upload</button>
              </div>
              <div className="rx-list">
                {prescriptions.map(rx => (
                  <div key={rx.id} className="rx-item">
                    <div className="rx-info">
                      <strong>{rx.name}</strong>
                      <small>{rx.doctor} • {rx.date}</small>
                    </div>
                    <button className="btn-download" onClick={() => handleDownload(rx.name, rx.file)}>Download</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Messages — kept for nav scroll */}
            <section id="messages" className="dash-card">
              <div className="card-title"><h3>Messages</h3></div>
              <p style={{ color: "#888", padding: "1rem 0" }}>No messages yet.</p>
            </section>

            {/* Inline Booking */}
            <section id="book" className="dash-card">
              <div className="card-title"><h3>Book Appointment</h3></div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"}}>
                <select className="form-input" id="book-doctor">
                  <option value="">Any Available Doctor</option>
                  {apiDoctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
                </select>
                <select className="form-input" id="book-specialty">
                  <option value="">Choose Specialty...</option>
                  {["Cardiology", "Neurology", "Dermatology", "Orthopedics", "General Medicine"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" className="form-input" id="book-date" />
                <select className="form-input" id="book-time">
                  <option value="">Choose Time...</option>
                  {["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="form-input" id="book-type" style={{gridColumn: "1 / -1"}}>
                  <option value="offline">In-Person Visit</option>
                  <option value="online">Video Consultation</option>
                </select>
                <button className="btn-primary" style={{gridColumn: "1 / -1", padding: "10px", borderRadius: "8px", border: "none"}} onClick={async () => {
                   const doctorId = document.getElementById("book-doctor").value;
                   const selDoc = apiDoctors.find(d => d._id === doctorId);
                   const doctorName = selDoc ? selDoc.name : "Any Available Doctor";
                   const specialty = document.getElementById("book-specialty").value;
                   const date = document.getElementById("book-date").value;
                   const time = document.getElementById("book-time").value;
                   const type = document.getElementById("book-type").value;
                   if(!specialty || !date || !time) return alert("Please fill specialty, date and time.");
                   try{
                     const token = localStorage.getItem("token");
                     if (!token) {
                       alert("You must be signed in to book an appointment!");
                       return;
                     }
                     await apiFetch("/appointments", {
                       method: "POST",
                       body: JSON.stringify({ doctor: doctorId || null, doctorName: doctorName, specialty, date, time, type, notes: "" })
                     });
                     alert("Appointment booked successfully!");
                     window.location.reload();
                   }catch(err){ alert("Booking failed: "+err.message); }
                }}>Book Now</button>
              </div>
            </section>

          </div>

          {/* Right Column */}
          <div className="dash-right">
            <section className="dash-card">
              <h3>Appointment Calendar</h3>
              {renderCalendar()}
              <div className="calendar-legend">
                <span><i className="dot-appointment"></i> Appointment</span>
                <span><i className="dot-today"></i> Today</span>
              </div>
            </section>

            <section className="dash-card video-card">
              <h3>Video Consultation</h3>
              <div className="video-preview"><p>Start a video call with your doctor</p></div>
              <h4>Available Doctors</h4>
              <div className="doctor-list">
                {availableDoctors.map((doc, i) => (
                  <div key={i} className="doctor-item">
                    <img src={doc.avatar} alt={doc.name} />
                    <div className="doctor-info">
                      <strong>{doc.name}</strong>
                      <small>{doc.specialty}</small>
                    </div>
                    <span className={`status-dot ${doc.available ? 'online' : 'offline'}`}></span>
                    <button className={`btn-call ${!doc.available ? 'disabled' : ''}`}
                      onClick={() => doc.available && handleVideoCall(doc)} disabled={!doc.available}>
                      {doc.available ? 'Call' : 'Busy'}
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-schedule">Schedule Video Call</button>
            </section>
          </div>
        </div>
      </main>

      {/* ── Injected Modal & Profile Styles ── */}
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.48);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        .modal-box {
          background: #fff; border-radius: 16px;
          width: 90%; max-width: 700px; max-height: 82vh;
          display: flex; flex-direction: column;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
          animation: slideUp 0.2s ease; overflow: hidden;
        }
        @keyframes slideUp { from { transform:translateY(24px);opacity:0 } to { transform:translateY(0);opacity:1 } }

        .upload-modal-box { max-width: 460px; }
        .profile-box { max-width: 580px; }

        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem; border-bottom: 1px solid #eee;
        }
        .modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin: 0; }
        .modal-close {
          background: none; border: none; font-size: 1.2rem; cursor: pointer;
          color: #888; padding: 0.2rem 0.5rem; border-radius: 6px; transition: background 0.15s;
        }
        .modal-close:hover { background: #f0f0f0; color: #333; }
        .modal-body { overflow-y: auto; padding: 1.25rem 1.5rem; flex: 1; }

        .drop-zone {
          border: 2px dashed #c8d6e5; border-radius: 12px; padding: 2.5rem 1.5rem;
          text-align: center; cursor: pointer; background: #f8faff; margin-bottom: 1.25rem;
          transition: border-color 0.2s, background 0.2s;
        }
        .drop-zone:hover { border-color: #4a7c59; background: #f0f7f2; }
        .drop-zone-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .drop-zone p { margin: 0.25rem 0; color: #555; font-size: 0.95rem; }
        .drop-zone-sub { color: #888 !important; font-size: 0.85rem !important; }
        .drop-zone-hint { color: #aaa !important; font-size: 0.78rem !important; margin-top: 0.5rem !important; }
        .drop-zone-filename { font-weight: 600; color: #2d6a4f !important; }
        .link-text { color: #4a7c59; text-decoration: underline; }

        .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
        .btn-cancel {
          padding: 0.55rem 1.25rem; border-radius: 8px; border: 1px solid #ddd;
          background: #fff; color: #555; cursor: pointer; font-size: 0.9rem; transition: background 0.15s;
        }
        .btn-cancel:hover { background: #f5f5f5; }

        .upload-success { text-align: center; padding: 1.5rem 0; }
        .success-icon {
          width: 60px; height: 60px; background: #d1fae5; color: #059669;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem; margin: 0 auto 1rem; font-weight: 700;
        }
        .upload-success h3 { color: #1a1a2e; margin: 0 0 0.5rem; }
        .upload-success p { color: #666; font-size: 0.95rem; }

        /* Profile */
        .profile-body { padding: 1.5rem; }
        .profile-avatar-row { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; }
        .profile-avatar-circle {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #4a7c59, #2d6a4f);
          color: #fff; font-size: 1.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
        .profile-field {
          display: flex; flex-direction: column; gap: 0.2rem;
          background: #f8faff; border-radius: 10px; padding: 0.75rem 1rem;
        }
        .profile-label { font-size: 0.72rem; color: #999; text-transform: uppercase; letter-spacing: 0.06em; }
        .profile-value { font-size: 0.93rem; color: #1a1a2e; font-weight: 600; }
        @media (max-width: 500px) { .profile-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
