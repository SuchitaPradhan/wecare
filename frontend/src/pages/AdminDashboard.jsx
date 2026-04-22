import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../config/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todaysAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    availableDoctors: 0,
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/admin/stats"),
      apiFetch("/admin/users?role=doctor"),
      apiFetch("/admin/users?role=patient"),
      apiFetch("/appointments/all"),
    ])
      .then(([statsResponse, doctorsResponse, patientsResponse, appointmentsResponse]) => {
        setStats(statsResponse || {});
        setDoctors(Array.isArray(doctorsResponse) ? doctorsResponse : []);
        setPatients(Array.isArray(patientsResponse) ? patientsResponse : []);
        setAppointments(Array.isArray(appointmentsResponse) ? appointmentsResponse : []);
      })
      .catch((error) => {
        alert(error.message || "Failed to load admin dashboard");
      });
  }, []);

  const appointmentsByDoctor = useMemo(() => {
    const summary = new Map();

    appointments.forEach((appointment) => {
      const doctorId = appointment.doctor?._id || appointment.doctorName;
      if (!summary.has(doctorId)) {
        summary.set(doctorId, {
          id: doctorId,
          name: appointment.doctor?.name || appointment.doctorName || "Unassigned",
          specialty: appointment.doctor?.specialty || appointment.specialty,
          patients: 0,
          pending: 0,
          cancelled: 0,
          completed: 0,
        });
      }

      const doctor = summary.get(doctorId);
      doctor.patients += 1;
      if (appointment.status === "Upcoming" || appointment.status === "Pending") {
        doctor.pending += 1;
      }
      if (appointment.status === "Cancelled") {
        doctor.cancelled += 1;
      }
      if (appointment.status === "Completed") {
        doctor.completed += 1;
      }
    });

    return Array.from(summary.values());
  }, [appointments]);

  const scrollToSection = (id) => {
    setActiveNav(id);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">WECARE Admin</h2>

        <nav>
          {[
            ["dashboard", "Dashboard"],
            ["doctors", "Doctors"],
            ["patients", "Patients"],
            ["appointments", "Appointments"],
            ["reports", "Reports"],
          ].map(([id, label]) => (
            <a
              key={id}
              className={activeNav === id ? "active" : ""}
              onClick={() => scrollToSection(id)}
              style={{ cursor: "pointer" }}
            >
              {label}
            </a>
          ))}
          <a onClick={handleLogout} style={{ cursor: "pointer" }}>
            Logout
          </a>
        </nav>
      </aside>

      <main className="admin-main">
        <div id="dashboard">
          <header className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Live operational overview from the backend.</p>
          </header>

          <section className="stats-grid">
            <div className="stat-card blue">
              <h3>Total Doctors</h3>
              <p>{stats.totalDoctors || 0}</p>
              <span>Registered specialists</span>
            </div>
            <div className="stat-card green">
              <h3>Total Patients</h3>
              <p>{stats.totalPatients || 0}</p>
              <span>Registered patients</span>
            </div>
            <div className="stat-card purple">
              <h3>Today's Appointments</h3>
              <p>{stats.todaysAppointments || 0}</p>
              <span>Scheduled today</span>
            </div>
            <div className="stat-card orange">
              <h3>Total Revenue</h3>
              <p>₹{(stats.totalRevenue || 0).toLocaleString()}</p>
              <span>Paid appointment revenue</span>
            </div>
          </section>

          <section className="admin-section">
            <h2>Doctor Appointment Activity</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Speciality</th>
                    <th>Patients</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsByDoctor.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.name}</td>
                      <td>{doctor.specialty || "Not assigned"}</td>
                      <td>{doctor.patients}</td>
                      <td>{doctor.pending}</td>
                      <td>{doctor.cancelled}</td>
                      <td>{doctor.completed}</td>
                    </tr>
                  ))}
                  {appointmentsByDoctor.length === 0 && (
                    <tr>
                      <td colSpan="6">No appointment activity yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section id="doctors" className="admin-section" style={{ marginTop: "40px" }}>
          <h2>Doctors</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Speciality</th>
                  <th>Hospital</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialty || "Not added"}</td>
                    <td>{doctor.hospital || "Not added"}</td>
                    <td>{doctor.city || "Not added"}</td>
                    <td>
                      <span className={`status ${doctor.isAvailable ? "active" : "inactive"}`}>
                        {doctor.isAvailable ? "Available" : "Busy"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="patients" className="admin-section" style={{ marginTop: "40px" }}>
          <h2>Patients</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Blood Group</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.bloodGroup || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="appointments"
          className="admin-section"
          style={{ marginTop: "40px" }}
        >
          <h2>Appointments</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Speciality</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.doctorName}</td>
                    <td>{appointment.specialty}</td>
                    <td>
                      {appointment.date} at {appointment.time}
                    </td>
                    <td>{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="reports"
          className="admin-section"
          style={{ marginTop: "40px", marginBottom: "40px" }}
        >
          <h2>Reports</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Available Doctors</td>
                  <td>{stats.availableDoctors || 0}</td>
                </tr>
                <tr>
                  <td>Pending Appointments</td>
                  <td>{stats.pendingAppointments || 0}</td>
                </tr>
                <tr>
                  <td>Completed Appointments</td>
                  <td>{stats.completedAppointments || 0}</td>
                </tr>
                <tr>
                  <td>Cancelled Appointments</td>
                  <td>{stats.cancelledAppointments || 0}</td>
                </tr>
                <tr>
                  <td>Total Appointments</td>
                  <td>{stats.totalAppointments || 0}</td>
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
