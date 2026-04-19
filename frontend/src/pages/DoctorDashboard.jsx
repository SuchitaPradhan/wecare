import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";
// ── Data ─────────────────────────────────────────────────────────────────────

const FOLLOW_UP_PATIENTS = [
  {
    id: 1, name: "Adam Messy", gender: "Male", age: 26, ward: "#123456",
    priority: "Medium", start: "June 3", end: "",
    disease: "Hypertension", bloodType: "O+", phone: "+91 98765 43210",
    email: "adam.messy@email.com",
    report: "Patient presents with persistent hypertension (BP 148/92). Currently on Amlodipine 5mg. Follow-up required to assess medication efficacy and lifestyle compliance.",
    tests: [
      { name: "Blood Pressure Monitoring", date: "June 3, 2026", status: "Completed", result: "148/92 mmHg" },
      { name: "Lipid Profile", date: "June 3, 2026", status: "Completed", result: "LDL: 130 mg/dL" },
      { name: "ECG", date: "June 5, 2026", status: "Pending", result: "—" },
      { name: "Renal Function Test", date: "June 10, 2026", status: "Pending", result: "—" },
    ],
    prescriptions: ["Amlodipine 5mg OD", "Aspirin 75mg OD", "Atenolol 25mg BD"],
    nextVisit: "June 17, 2026",
  },
  {
    id: 2, name: "Celine Aluista", gender: "Female", age: 22, ward: "#985746",
    priority: "Low", start: "May 31", end: "June 4",
    disease: "Migraine", bloodType: "A+", phone: "+91 91234 56789",
    email: "celine.aluista@email.com",
    report: "Patient experiencing recurrent migraine episodes (2-3/week). Trigger identified: screen exposure and dehydration. Prophylactic therapy initiated.",
    tests: [
      { name: "MRI Brain", date: "May 31, 2026", status: "Completed", result: "Normal" },
      { name: "CBC", date: "May 31, 2026", status: "Completed", result: "Normal" },
      { name: "Ophthalmology Consult", date: "June 8, 2026", status: "Pending", result: "—" },
    ],
    prescriptions: ["Sumatriptan 50mg PRN", "Propranolol 20mg BD", "Paracetamol 500mg SOS"],
    nextVisit: "June 14, 2026",
  },
  {
    id: 3, name: "Malachi Ardo", gender: "Male", age: 19, ward: "#047638",
    priority: "High", start: "June 7", end: "",
    disease: "Type 1 Diabetes", bloodType: "B+", phone: "+91 87654 32109",
    email: "malachi.ardo@email.com",
    report: "Newly diagnosed T1DM. HbA1c: 11.2%. Patient requires intensive insulin therapy and diabetes education. Blood sugar poorly controlled.",
    tests: [
      { name: "HbA1c", date: "June 7, 2026", status: "Completed", result: "11.2%" },
      { name: "Fasting Blood Glucose", date: "June 7, 2026", status: "Completed", result: "310 mg/dL" },
      { name: "C-Peptide", date: "June 7, 2026", status: "Completed", result: "Low" },
      { name: "Kidney Function Test", date: "June 12, 2026", status: "Pending", result: "—" },
      { name: "Ophthalmology Screening", date: "June 14, 2026", status: "Pending", result: "—" },
    ],
    prescriptions: ["Insulin Glargine 20U HS", "Insulin Aspart 8U TDS", "Metformin 500mg BD"],
    nextVisit: "June 21, 2026",
  },
  {
    id: 4, name: "Mathias Olivera", gender: "Male", age: 24, ward: "#248957",
    priority: "Medium", start: "June 1", end: "June 5",
    disease: "Asthma", bloodType: "AB-", phone: "+91 76543 21098",
    email: "mathias.olivera@email.com",
    report: "Moderate persistent asthma. Triggered by dust and cold air. Spirometry shows FEV1 68%. Step-up therapy started.",
    tests: [
      { name: "Spirometry", date: "June 1, 2026", status: "Completed", result: "FEV1: 68%" },
      { name: "Chest X-Ray", date: "June 1, 2026", status: "Completed", result: "Hyperinflation noted" },
      { name: "Allergy Panel", date: "June 8, 2026", status: "Pending", result: "—" },
    ],
    prescriptions: ["Budesonide/Formoterol 160/4.5 BD", "Salbutamol inhaler PRN", "Montelukast 10mg OD"],
    nextVisit: "June 15, 2026",
  },
];

const NEW_APPOINTMENTS = [
  {
    id: 101, name: "Priya Nair", gender: "Female", age: 34, time: "09:00 AM",
    date: "June 10, 2026", illness: "Chest Pain & Palpitations",
    reason: "New patient with 2-week history of chest tightness and occasional palpitations. No prior cardiac history.",
    vitals: { bp: "130/85", hr: "92 bpm", temp: "98.6°F", spo2: "97%" },
    insurance: "Star Health", status: "Confirmed",
    schedule: [
      { time: "09:00 AM", activity: "Patient Arrival & Registration" },
      { time: "09:15 AM", activity: "Vitals & Nursing Assessment" },
      { time: "09:30 AM", activity: "Physician Consultation" },
      { time: "10:00 AM", activity: "ECG & Blood Tests" },
      { time: "10:30 AM", activity: "Review Results & Diagnosis" },
      { time: "11:00 AM", activity: "Prescription & Discharge" },
    ]
  },
  {
    id: 102, name: "Ravi Shankar", gender: "Male", age: 45, time: "10:30 AM",
    date: "June 10, 2026", illness: "Chronic Back Pain",
    reason: "6-month history of lower back pain radiating to left leg. Desk job. Previous physiotherapy with partial relief.",
    vitals: { bp: "122/78", hr: "76 bpm", temp: "98.2°F", spo2: "99%" },
    insurance: "HDFC Ergo", status: "Confirmed",
    schedule: [
      { time: "10:30 AM", activity: "Patient Arrival" },
      { time: "10:45 AM", activity: "Vitals Check" },
      { time: "11:00 AM", activity: "Physician Consultation & Examination" },
      { time: "11:30 AM", activity: "MRI Review" },
      { time: "12:00 PM", activity: "Physiotherapy Referral & Plan" },
    ]
  },
  {
    id: 103, name: "Sita Devi", gender: "Female", age: 58, time: "12:00 PM",
    date: "June 10, 2026", illness: "Knee Osteoarthritis",
    reason: "Progressive bilateral knee pain for 2 years. Difficulty climbing stairs. X-ray shows Grade III OA.",
    vitals: { bp: "138/88", hr: "80 bpm", temp: "98.4°F", spo2: "96%" },
    insurance: "Niva Bupa", status: "Pending",
    schedule: [
      { time: "12:00 PM", activity: "Patient Arrival" },
      { time: "12:15 PM", activity: "Vitals & Nursing Notes" },
      { time: "12:30 PM", activity: "Physician Consultation" },
      { time: "01:00 PM", activity: "X-Ray Review" },
      { time: "01:20 PM", activity: "Injection / Medication Plan" },
      { time: "01:45 PM", activity: "Physiotherapy Referral" },
    ]
  },
];

const PAYMENT_HISTORY = [
  { id: "INV-001", patient: "Adam Messy", date: "June 3, 2026", amount: 1200, service: "Consultation + Tests", status: "Paid" },
  { id: "INV-002", patient: "Celine Aluista", date: "June 1, 2026", amount: 800, service: "Consultation", status: "Paid" },
  { id: "INV-003", patient: "Priya Nair", date: "June 10, 2026", amount: 2400, service: "Consultation + ECG + Blood Tests", status: "Pending" },
  { id: "INV-004", patient: "Malachi Ardo", date: "June 7, 2026", amount: 3500, service: "Diabetes Management Package", status: "Paid" },
  { id: "INV-005", patient: "Ravi Shankar", date: "June 10, 2026", amount: 1800, service: "Consultation + MRI Review", status: "Pending" },
  { id: "INV-006", patient: "Mathias Olivera", date: "June 2, 2026", amount: 950, service: "Spirometry + Consultation", status: "Paid" },
];

const SHIFT_SCHEDULE = {
  8: [{ type: "surgery", label: "Appendectomy – OT2", time: "08:00–10:00" }],
  10: [{ type: "evaluation", label: "Malachi Ardo – Diabetes Review", time: "10:00–10:45" }],
  11: [{ type: "polyclinic", label: "Polyclinic OPD", time: "11:00–13:00" }],
  13: [{ type: "evaluation", label: "Adam Messy – BP Check", time: "13:00–13:30" }],
  16: [{ type: "surgery", label: "Hernia Repair – OT1", time: "16:00–18:00" }, { type: "polyclinic", label: "Evening OPD", time: "16:30–18:30" }],
  17: [{ type: "evaluation", label: "Celine Aluista – Migraine F/U", time: "17:00–17:30" }],
  18: [{ type: "polyclinic", label: "Polyclinic Evening", time: "18:00–19:30" }],
  19: [{ type: "surgery", label: "Emergency Consult", time: "19:00–19:45" }],
  22: [{ type: "evaluation", label: "Mathias Olivera – Asthma Review", time: "22nd Mar – 09:00" }],
  23: [{ type: "polyclinic", label: "Polyclinic OPD", time: "23rd Mar – 11:00–13:00" }],
  24: [{ type: "surgery", label: "Knee Replacement – OT3", time: "24th Mar – 08:00" }],
  25: [{ type: "evaluation", label: "New Patient Evaluation", time: "25th Mar – 10:00" }],
  27: [{ type: "polyclinic", label: "Weekend OPD", time: "27th Mar – 09:00–12:00" }],
};

const DOT_COLORS = { surgery: "#2563eb", polyclinic: "#ea580c", evaluation: "#16a34a" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function priorityStyle(p) {
  if (p === "High") return { bg: "#fef2f2", color: "#ef4444" };
  if (p === "Low") return { bg: "#f0fdf4", color: "#16a34a" };
  return { bg: "#fffbeb", color: "#f59e0b" };
}

function statusPayStyle(s) {
  return s === "Paid"
    ? { bg: "#dcfce7", color: "#16a34a" }
    : { bg: "#fef9c3", color: "#ca8a04" };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Modal({ onClose, children }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

function ProfileModal({ user, onClose, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    role: "doctor",
    specialty: user.specialty || "General Medicine",
    department: user.department || "Internal Medicine",
    license: user.license || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      if (setUser) setUser(data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        style={{
          ...S.modalBox,
          maxWidth: 620,
          padding: "32px 36px",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button style={S.closeBtn} onClick={onClose}>✕</button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, color: "#fff", fontWeight: 700, flexShrink: 0,
            boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
          }}>
            {user.name?.[0] || "D"}
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ fontSize: 20, fontWeight: 700, padding: 4, width: "100%", marginBottom: 4 }}
              />
            ) : (
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{user.name || "Dr. Smith"}</h2>
            )}
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Doctor · {user.department || "Internal Medicine"}
            </p>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            style={{ padding: "8px 16px", background: isEditing ? "#16a34a" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
          >
            {saving ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>

        {error && <div style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {/* Profile fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {isEditing ? (
            <>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>📞 Phone</div>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: "100%", padding: 4, border: "1px solid #ccc", borderRadius: "4px" }} />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>🩺 Specialization</div>
                <input value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} style={{ width: "100%", padding: 4, border: "1px solid #ccc", borderRadius: "4px" }} />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>🏛️ Department</div>
                <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: "100%", padding: 4, border: "1px solid #ccc", borderRadius: "4px" }} />
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>🪪 License No.</div>
                <input value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} style={{ width: "100%", padding: 4, border: "1px solid #ccc", borderRadius: "4px" }} />
              </div>
            </>
          ) : (
            [
              ["👤 Full Name", user.name || "Dr. Smith"],
              ["🏥 Role", "Doctor"],
              ["✉️ Email", user.email || "doctor@wecare.com"],
              ["📞 Phone", user.phone || "+91 98765 43210"],
              ["🩺 Specialization", user.specialty || "General Medicine"],
              ["🏛️ Department", user.department || "Internal Medicine"],
              ["🪪 License No.", user.license || "MCI-2024-XY891"],
              ["📅 Joined", user.joined || "January 2022"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{val}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PatientDetailModal({ patient, onClose }) {
  const ps = priorityStyle(patient.priority);
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
          {patient.name[0]}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{patient.name}</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{patient.gender}, {patient.age} yrs • Ward {patient.ward} • Blood: {patient.bloodType}</p>
        </div>
        <span style={{ marginLeft: "auto", background: ps.bg, color: ps.color, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{patient.priority}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[["🩺 Disease", patient.disease], ["📅 Next Visit", patient.nextVisit], ["📞 Phone", patient.phone], ["✉️ Email", patient.email]].map(([label, val]) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{val}</div>
          </div>
        ))}
      </div>

      <Section title="Disease Report">
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0 }}>{patient.report}</p>
      </Section>

      <Section title="Tests & Results">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Test", "Date", "Status", "Result"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patient.tests.map((t, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "9px 10px", color: "#334155", fontWeight: 500 }}>{t.name}</td>
                <td style={{ padding: "9px 10px", color: "#64748b" }}>{t.date}</td>
                <td style={{ padding: "9px 10px" }}>
                  <span style={{ background: t.status === "Completed" ? "#dcfce7" : "#fef9c3", color: t.status === "Completed" ? "#16a34a" : "#ca8a04", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{t.status}</span>
                </td>
                <td style={{ padding: "9px 10px", color: "#64748b" }}>{t.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Prescriptions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {patient.prescriptions.map((rx, i) => (
            <span key={i} style={{ background: "#eff6ff", color: "#2563eb", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500 }}>💊 {rx}</span>
          ))}
        </div>
      </Section>
    </Modal>
  );
}

function AppointmentDetailModal({ apt, onClose }) {
  const statusStyle = apt.status === "Confirmed" ? { bg: "#dcfce7", color: "#16a34a" } : { bg: "#fef9c3", color: "#ca8a04" };
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#ca8a04" }}>
          {apt.name[0]}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{apt.name}</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{apt.gender}, {apt.age} yrs • {apt.date} at {apt.time}</p>
        </div>
        <span style={{ marginLeft: "auto", background: statusStyle.bg, color: statusStyle.color, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{apt.status}</span>
      </div>

      <div style={{ background: "#fff7ed", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>🏥 Presenting Complaint</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#ea580c", marginBottom: 6 }}>{apt.illness}</div>
        <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.7 }}>{apt.reason}</p>
      </div>

      <Section title="Vitals">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[["🩸 BP", apt.vitals.bp], ["❤️ HR", apt.vitals.hr], ["🌡️ Temp", apt.vitals.temp], ["💨 SpO2", apt.vitals.spo2]].map(([label, val]) => (
            <div key={label} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{val}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Appointment Schedule">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {apt.schedule.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 24 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", marginTop: 4, flexShrink: 0 }} />
                {i < apt.schedule.length - 1 && <div style={{ width: 2, height: 28, background: "#e2e8f0" }} />}
              </div>
              <div style={{ paddingBottom: 12 }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{s.time}</span>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#334155", fontWeight: 500 }}>{s.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
        🛡️ Insurance: <strong style={{ color: "#334155" }}>{apt.insurance}</strong>
      </div>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>{title}</h4>
      {children}
    </div>
  );
}

function CalendarWidget({ shifts = SHIFT_SCHEDULE, compact = false }) {
  // Default to current month: March 2026
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const today = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const year = month.getFullYear();
  const mon = month.getMonth();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const startDay = new Date(year, mon, 1).getDay();

  const dayShifts = selectedDay ? (shifts[selectedDay] || []) : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: compact ? "center" : "space-between", alignItems: "center", marginBottom: 14 }}>
        {!compact && (
          <div style={{ display: "flex", gap: 8 }}>
            {[["surgery", "Surgery"], ["polyclinic", "Polyclinic"], ["evaluation", "Evaluation"]].map(([key, label]) => (
              <span key={key} style={{ fontSize: 11, color: DOT_COLORS[key], background: key === "surgery" ? "#eff6ff" : key === "polyclinic" ? "#fff7ed" : "#f0fdf4", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>● {label}</span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: compact ? 0 : "auto" }}>
          <button onClick={() => setMonth(new Date(year, mon - 1, 1))} style={S.calBtn}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", minWidth: 120, textAlign: "center" }}>{monthNames[mon]} {year}</span>
          <button onClick={() => setMonth(new Date(year, mon + 1, 1))} style={S.calBtn}>›</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dayShiftsForDay = shifts[day] || [];
          const dots = [...new Set(dayShiftsForDay.map(s => s.type))];
          const isToday = day === today && mon === todayMonth && year === todayYear;
          const isSelected = day === selectedDay;
          return (
            <div key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
              style={{
                borderRadius: 8, padding: compact ? "4px 2px" : "6px 4px", cursor: "pointer", textAlign: "center",
                background: isSelected ? "#2563eb" : isToday ? "#eff6ff" : "transparent",
                border: isToday && !isSelected ? "1.5px solid #2563eb" : "1.5px solid transparent",
                transition: "all 0.15s",
              }}>
              <div style={{ fontSize: 12, fontWeight: isToday || isSelected ? 700 : 400, color: isSelected ? "#fff" : isToday ? "#2563eb" : "#334155" }}>{day}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
                {dots.map((type, i) => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#fff" : DOT_COLORS[type] }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={{ marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            {monthNames[mon]} {selectedDay} — Shifts
          </div>
          {dayShifts.length === 0 ? (
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No shifts scheduled</p>
          ) : (
            dayShifts.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: DOT_COLORS[s.type], flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{s.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, backdropFilter: "blur(8px)",
  },
  modalBox: {
    background: "#fff", borderRadius: 20, width: "92%", maxWidth: 680,
    maxHeight: "88vh", overflowY: "auto", padding: "28px 32px",
    boxShadow: "0 32px 80px rgba(15,23,42,0.2)", position: "relative",
    animation: "slideUp 0.2s ease",
  },
  closeBtn: {
    position: "absolute", top: 16, right: 16, background: "#f1f5f9",
    border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer",
    fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
  },
  calBtn: {
    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
    width: 28, height: 28, cursor: "pointer", fontSize: 16, color: "#64748b",
    display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
  },
};

// ── Main Component ────────────────────────────────────────────────────────────

const DoctorDashboard = () => {
  const [user, setUser] = useState({ name: "Dr. Smith", role: "doctor", email: "doctor@wecare.com" });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [patientList, setPatientList] = useState(FOLLOW_UP_PATIENTS);
  const [newAppointments, setNewAppointments] = useState(NEW_APPOINTMENTS);
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  // Current date info for Working Track
  const now = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentDateLabel = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`;

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiFetch(`/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      alert(`Appointment status updated to ${newStatus}`);
      
      setNewAppointments(prev => prev.filter(a => a.id !== id));
      
      if(newStatus !== "Cancelled") {
        setPatientList(prev => {
          const apt = [...newAppointments, ...patientList].find(a => a.id === id);
          if(!apt) return prev;
          apt.status = newStatus;
          apt.priority = newStatus === "Completed" ? "Completed" : "High";
          return [...prev.filter(p => p.id !== id), apt];
        });
      } else {
        setPatientList(prev => prev.filter(p => p.id !== id));
      }
    } catch(err) {
      alert("Failed to update status: " + err.message);
    }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) setUser(JSON.parse(loggedInUser));
    
    apiFetch("/auth/profile").then(data => {
      setUser(prev => ({ ...prev, ...data, role: "doctor" }));
    }).catch(console.log);

    apiFetch("/appointments/doctor").then(data => {
      if(Array.isArray(data) && data.length > 0) {
        const mapped = data.map(apt => ({
          ...apt, id: apt._id, name: apt.patientName || "Patient", gender: "Unknown", age: 30,
          time: apt.time, date: apt.date, illness: apt.specialty || "Checkup",
          reason: apt.notes || "", vitals: { bp: "120/80", hr: "75 bpm", temp: "98.6°F", spo2: "98%" },
          insurance: "N/A", status: apt.status || "Upcoming",
          schedule: [{ time: apt.time, activity: "Consultation" }],
          tests: [], prescriptions: []
        }));
        setNewAppointments(mapped.filter(a => a.status === "Upcoming" || a.status === "Pending"));
        setPatientList(mapped.filter(a => a.status !== "Upcoming" && a.status !== "Pending"));
      }
    }).catch(console.error);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id) => {
    if (id === "profile") {
      setShowProfile(true);
      setActiveNav("profile");
      return;
    }
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/signin");
  };

  const markComplete = (id) => {
    handleUpdateStatus(id, "Completed");
  };

  const totalPaid = PAYMENT_HISTORY.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = PAYMENT_HISTORY.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "follow-up", label: "Follow-Up Patients" },
    { id: "appointments", label: "New Appointments" },
    { id: "payment", label: "Payment" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="dashboard">
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .patient-row:hover { background: #f8fafc !important; cursor: pointer; }
        .apt-row:hover { background: #fff7ed !important; cursor: pointer; }
        .cal-day:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* Modals */}
      {selectedFollowUp && <PatientDetailModal patient={selectedFollowUp} onClose={() => setSelectedFollowUp(null)} />}
      {selectedAppointment && <AppointmentDetailModal apt={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}
      {showProfile && <ProfileModal user={user} setUser={setUser} onClose={() => { setShowProfile(false); setActiveNav("dashboard"); }} />}

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="doctor-card">
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", fontWeight: 700 }}>
            {user.name?.[0] || "D"}
          </div>
          <h3>{user.name}</h3>
          <p>Doctor</p>
        </div>

        <ul className="nav">
          {navItems.map(item => (
            <li key={item.id} className={activeNav === item.id ? "active" : ""} onClick={() => scrollToSection(item.id)}>
              {item.label}
            </li>
          ))}
          <li className="logout" onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <main className="main">

        {/* ── DASHBOARD HEADER ─────────────────────────────────── */}
        <div id="dashboard">
          <div className="topbar">
            <h2>Dashboard</h2>
            <input type="text" placeholder="Search patients..." />
          </div>

          <p style={{ marginBottom: 24, color: "#64748b" }}>
            Good Morning, <b>{user.name}!</b> You have <b>{patientList.length} follow-up patients</b> and <b>{NEW_APPOINTMENTS.length} new appointments</b> today.
          </p>

          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <span>Follow-Up Patients</span>
              <h3>{patientList.length}</h3>
              <small className="badge">Today</small>
            </div>
            <div className="stat">
              <span>New Appointments</span>
              <h3>{NEW_APPOINTMENTS.length}</h3>
              <small className="badge">Upcoming</small>
            </div>
            <div className="stat">
              <span>Pending Reports</span>
              <h3>{patientList.filter(p => p.tests.some(t => t.status === "Pending")).length}</h3>
              <small className="badge">To Review</small>
            </div>
          </div>

          {/* Top Grid: Follow-Up Patients & Working Track */}
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", marginBottom: 28 }}>
            <div id="follow-up" className="card" style={{ height: "650px", overflowY: "auto" }}>
              <div style={{ position: "sticky", top: 0, background: "white", paddingBottom: "10px", zIndex: 1, borderBottom: "1px solid #f1f5f9", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0, paddingBottom: 4 }}>Follow-Up Patient List</h4>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Click on a patient to view full details</p>
              </div>
              {patientList.map((p) => {
                const ps = priorityStyle(p.priority === "Completed" ? "Low" : p.priority);
                return (
                  <div key={p.id} className="patient-row"
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 12px", borderRadius: 14, marginBottom: 8, border: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onClick={() => setSelectedFollowUp(p)}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#2563eb", fontSize: 16, flexShrink: 0 }}>
                      {p.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{p.gender}, {p.age} yrs • Ward {p.ward} • 🩺 {p.disease} • Next: {p.nextVisit}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ background: ps.bg, color: ps.color, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {p.priority === "Completed" ? "✓ Done" : p.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", height: "650px", overflowY: "auto" }}>
              <div style={{ position: "sticky", top: 0, background: "white", paddingBottom: "10px", zIndex: 1 }}>
                  <h4 style={{ margin: 0 }}>Working Track</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 110, height: 110, borderRadius: "50%", background: "conic-gradient(#2563eb 0% 65%, #e2e8f0 65% 100%)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0 8px" }}>
                  <div style={{ width: 88, height: 88, background: "white", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <b style={{ fontSize: 17, color: "#0f172a" }}>{currentTime || "—"}</b>
                    <small style={{ fontSize: 10, color: "#64748b" }}>Live</small>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{currentDateLabel}</p>
              </div>
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                <CalendarWidget compact={true} />
              </div>
            </div>
          </div>

          {/* New Appointments */}
          <div id="appointments" className="card" style={{ height: "450px", overflowY: "auto", marginBottom: 28 }}>
              <div style={{ position: "sticky", top: 0, background: "white", paddingBottom: "10px", zIndex: 1, borderBottom: "1px solid #f1f5f9", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0, paddingBottom: 4 }}>New Appointments</h4>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Click on an appointment to view schedule & details</p>
              </div>
              
              {newAppointments.length === 0 && (
                <p style={{ fontSize: 13, color: "#94a3b8", padding: "10px" }}>No new appointments.</p>
              )}

              {newAppointments.map((apt) => {
                const ss = apt.status === "Confirmed" ? { bg: "#dcfce7", color: "#16a34a" } : { bg: "#fef9c3", color: "#ca8a04" };
                return (
                  <div key={apt.id} className="apt-row"
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 12px", borderRadius: 14, marginBottom: 8, border: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onClick={() => setSelectedAppointment(apt)}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#ea580c", fontSize: 16, flexShrink: 0 }}>
                      {apt.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{apt.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {apt.gender}, {apt.age} yrs • {apt.date} at {apt.time}
                      </div>
                      <div style={{ fontSize: 12, color: "#ea580c", fontWeight: 600, marginTop: 2 }}>🏥 {apt.illness}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ background: ss.bg, color: ss.color, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{apt.status}</span>
                      
                      {apt.status !== "Confirmed" && (
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(apt.id, "Confirmed"); }}
                            style={{ padding: "4px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(apt.id, "Cancelled"); }}
                            style={{ padding: "4px 10px", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <span style={{ fontSize: 11, color: "#94a3b8" }}>🛡️ {apt.insurance}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* ── PAYMENT ────────────────────────────────────────── */}
        <div id="payment" className="card" style={{ marginTop: 32, marginBottom: 32 }}>
          <h4>Payment History</h4>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[["💰 Total Revenue", `₹${(totalPaid + totalPending).toLocaleString()}`, "#f8fafc", "#1e293b"],
              ["✅ Collected", `₹${totalPaid.toLocaleString()}`, "#f0fdf4", "#16a34a"],
              ["⏳ Pending", `₹${totalPending.toLocaleString()}`, "#fef9c3", "#ca8a04"]
            ].map(([label, val, bg, color]) => (
              <div key={label} style={{ background: bg, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Invoice", "Patient", "Date", "Service", "Amount", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENT_HISTORY.map((pay) => {
                const ps = statusPayStyle(pay.status);
                return (
                  <tr key={pay.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", color: "#2563eb", fontWeight: 600 }}>{pay.id}</td>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#0f172a" }}>{pay.patient}</td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{pay.date}</td>
                    <td style={{ padding: "12px", color: "#475569" }}>{pay.service}</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#1e293b" }}>₹{pay.amount.toLocaleString()}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: ps.bg, color: ps.color, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{pay.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default DoctorDashboard;