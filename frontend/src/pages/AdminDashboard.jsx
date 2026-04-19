import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import doctorsDataFallback from "../data/doctors.json";
import { apiFetch, API_BASE } from "../config/api";

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [doctorStats, setDoctorStats] = useState([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [availableDoctorsCount, setAvailableDoctorsCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalPatientsToday, setTotalPatientsToday] = useState(0);

  useEffect(() => {
    // Fetch doctors from API
    fetch(`${API_BASE}/doctors`)
      .then((res) => res.json())
      .then((docs) => {
        if (Array.isArray(docs) && docs.length > 0) {
          const stats = docs.map((d) => ({
            ...d,
            id: d._id || d.id,
            speciality: d.specialty || d.speciality,
            patients: Math.floor(Math.random() * 20) + 5,
            pending: Math.floor(Math.random() * 5),
            cancelled: Math.floor(Math.random() * 3),
            todayIncome: Math.floor(Math.random() * 5000) + 2000,
            isAvailable: d.isAvailable !== undefined ? d.isAvailable : Math.random() > 0.2,
          }));
          setDoctorStats(stats);
          setTotalDoctors(stats.length);
          setAvailableDoctorsCount(stats.filter((d) => d.isAvailable).length);
          setTotalIncome(stats.reduce((acc, curr) => acc + curr.todayIncome, 0));
          setTotalPatientsToday(stats.reduce((acc, curr) => acc + curr.patients, 0));
        }
      })
      .catch(() => {
        // Fallback to JSON
        const stats = doctorsDataFallback.map((doc) => ({
          ...doc,
          patients: Math.floor(Math.random() * 20) + 5,
          pending: Math.floor(Math.random() * 5),
          cancelled: Math.floor(Math.random() * 3),
          todayIncome: Math.floor(Math.random() * 5000) + 2000,
          isAvailable: Math.random() > 0.2,
        }));
        setDoctorStats(stats);
        setTotalDoctors(stats.length);
        setAvailableDoctorsCount(stats.filter((d) => d.isAvailable).length);
        setTotalIncome(stats.reduce((acc, curr) => acc + curr.todayIncome, 0));
        setTotalPatientsToday(stats.reduce((acc, curr) => acc + curr.patients, 0));
      });

    // Fetch real stats from admin API (if token available)
    const token = localStorage.getItem("token");
    if (token) {
      apiFetch("/admin/stats")
        .then((s) => {
          if (s.totalDoctors) setTotalDoctors(s.totalDoctors);
          if (s.availableDoctors !== undefined) setAvailableDoctorsCount(s.availableDoctors);
          if (s.totalRevenue) setTotalIncome(s.totalRevenue);
        })
        .catch(() => {});
    }
  }, []);

  const scrollToSection = (id) => {
    setActiveNav(id);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">WECARE Admin</h2>

        {/* ✅ Each nav link scrolls and highlights */}
        <nav>
          <a
            className={activeNav === "dashboard" ? "active" : ""}
            onClick={() => scrollToSection("dashboard")}
            style={{ cursor: "pointer" }}
          >
            Dashboard
          </a>
          <a
            className={activeNav === "doctors" ? "active" : ""}
            onClick={() => scrollToSection("doctors")}
            style={{ cursor: "pointer" }}
          >
            Doctors
          </a>
          <a
            className={activeNav === "patients" ? "active" : ""}
            onClick={() => scrollToSection("patients")}
            style={{ cursor: "pointer" }}
          >
            Patients
          </a>
          <a
            className={activeNav === "appointments" ? "active" : ""}
            onClick={() => scrollToSection("appointments")}
            style={{ cursor: "pointer" }}
          >
            Appointments
          </a>
          <a
            className={activeNav === "prescriptions" ? "active" : ""}
            onClick={() => scrollToSection("prescriptions")}
            style={{ cursor: "pointer" }}
          >
            Prescriptions
          </a>
          <a
            className={activeNav === "reports" ? "active" : ""}
            onClick={() => scrollToSection("reports")}
            style={{ cursor: "pointer" }}
          >
            Reports
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        {/* ✅ id="dashboard" — wraps the original dashboard content */}
        <div id="dashboard">
          {/* Header */}
          <header className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Overview of hospital performance today</p>
          </header>

          {/* Stats Cards */}
          <section className="stats-grid">
            <div className="stat-card blue">
              <h3>Total Doctors</h3>
              <p>{totalDoctors}</p>
              <span>Registered Specialists</span>
            </div>
            <div className="stat-card green">
              <h3>Today's Income</h3>
              <p>₹{totalIncome.toLocaleString()}</p>
              <span>Total Earnings Today</span>
            </div>
            <div className="stat-card purple">
              <h3>Available Doctors</h3>
              <p>{availableDoctorsCount} / {totalDoctors}</p>
              <span>Currently Active</span>
            </div>
            <div className="stat-card orange">
              <h3>Patients Today</h3>
              <p>{totalPatientsToday}</p>
              <span>Appointments Scheduled</span>
            </div>
          </section>

          {/* Doctor Activity Table */}
          <section className="admin-section">
            <h2>Doctor Appointment Activity</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Speciality</th>
                    <th>Patients (Today)</th>
                    <th>Pending Appts</th>
                    <th>Cancelled Appts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorStats.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="doctor-cell">
                          <div className="doctor-avatar-small">
                            <img src={`https://ui-avatars.com/api/?name=${doc.name}&background=random`} alt={doc.name} />
                          </div>
                          <span className="doctor-name-text">{doc.name}</span>
                        </div>
                      </td>
                      <td>{doc.speciality}</td>
                      <td>{doc.patients}</td>
                      <td>
                        {doc.pending > 0 ? (
                          <span className="badge badge-warning">{doc.pending} Pending</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {doc.cancelled > 0 ? (
                          <span className="badge badge-danger">{doc.cancelled} Cancelled</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`status ${doc.isAvailable ? "active" : "inactive"}`}>
                          {doc.isAvailable ? "Available" : "Busy"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ✅ id="doctors" */}
        <section id="doctors" className="admin-section" style={{ marginTop: "40px" }}>
          <h2>Doctors</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Speciality</th>
                  <th>Status</th>
                  <th>Today's Income</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar-small">
                          <img src={`https://ui-avatars.com/api/?name=${doc.name}&background=random`} alt={doc.name} />
                        </div>
                        <span className="doctor-name-text">{doc.name}</span>
                      </div>
                    </td>
                    <td>{doc.speciality}</td>
                    <td>
                      <span className={`status ${doc.isAvailable ? "active" : "inactive"}`}>
                        {doc.isAvailable ? "Available" : "Busy"}
                      </span>
                    </td>
                    <td>₹{doc.todayIncome.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ✅ id="patients" */}
        <section id="patients" className="admin-section" style={{ marginTop: "40px" }}>
          <h2>Patients</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Assigned Doctor</th>
                  <th>Speciality</th>
                  <th>Patients Today</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doc, i) => (
                  <tr key={doc.id}>
                    <td>{i + 1}</td>
                    <td>{doc.name}</td>
                    <td>{doc.speciality}</td>
                    <td>{doc.patients}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                  <td colSpan={3}>Total Patients Today</td>
                  <td>{totalPatientsToday}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ✅ id="appointments" */}
        <section id="appointments" className="admin-section" style={{ marginTop: "40px" }}>
          <h2>Appointments</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Speciality</th>
                  <th>Pending</th>
                  <th>Cancelled</th>
                  <th>Patients (Today)</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar-small">
                          <img src={`https://ui-avatars.com/api/?name=${doc.name}&background=random`} alt={doc.name} />
                        </div>
                        <span className="doctor-name-text">{doc.name}</span>
                      </div>
                    </td>
                    <td>{doc.speciality}</td>
                    <td>
                      {doc.pending > 0 ? (
                        <span className="badge badge-warning">{doc.pending} Pending</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {doc.cancelled > 0 ? (
                        <span className="badge badge-danger">{doc.cancelled} Cancelled</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{doc.patients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ✅ id="prescriptions" */}
        <section id="prescriptions" className="admin-section" style={{ marginTop: "40px" }}>
          <h2>Prescriptions</h2>
          <p style={{ color: "#64748b", padding: "1rem 0" }}>Prescription management coming soon.</p>
        </section>

        {/* ✅ id="reports" */}
        <section id="reports" className="admin-section" style={{ marginTop: "40px", marginBottom: "40px" }}>
          <h2>Reports</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Speciality</th>
                  <th>Patients Today</th>
                  <th>Today's Income</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar-small">
                          <img src={`https://ui-avatars.com/api/?name=${doc.name}&background=random`} alt={doc.name} />
                        </div>
                        <span className="doctor-name-text">{doc.name}</span>
                      </div>
                    </td>
                    <td>{doc.speciality}</td>
                    <td>{doc.patients}</td>
                    <td>₹{doc.todayIncome.toLocaleString()}</td>
                    <td>
                      <span className={`status ${doc.isAvailable ? "active" : "inactive"}`}>
                        {doc.isAvailable ? "Available" : "Busy"}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                  <td colSpan={3}>Total Income Today</td>
                  <td>₹{totalIncome.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
