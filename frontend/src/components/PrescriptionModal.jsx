import React, { useState } from "react";

function PrescriptionModal({ doctor, appointment, onClose, readOnly, prescriptionData }) {
  const [formData, setFormData] = useState(prescriptionData || {
    patientName: appointment?.patientName || "",
    date: appointment?.date || new Date().toISOString().split("T")[0],
    age: "",
    gender: "",
    weight: "",
    diagnosis: "",
    medicines: "",
    instructions: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }
    const existing = JSON.parse(localStorage.getItem("system_prescriptions") || "[]");
    existing.push({
      _id: Date.now().toString(),
      doctor: doctor,
      patientName: formData.patientName,
      date: formData.date,
      data: formData,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("system_prescriptions", JSON.stringify(existing));
    alert("Prescription saved successfully!");
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <div style={styles.prescriptionPaper}>
          {/* Header Section */}
          <div style={styles.header}>
            <div style={styles.headerShape}></div>
            <div style={styles.headerContent}>
              <h2 style={styles.doctorName}>
                {doctor?.name?.startsWith("Dr.") ? doctor.name : (doctor?.name ? "Dr. " + doctor.name : "Doctor Name")}
              </h2>
              <p style={styles.qualification}>{doctor?.qualification || "MBBS, MD"}</p>
            </div>
            {/* WECARE Logo text */}
            <div style={styles.logoText}>WECARE</div>
          </div>

          {/* Body Section */}
          <form id="prescription-form" onSubmit={handleSave} style={styles.body}>
            <div style={styles.patientInfoGrid}>
              <div style={styles.inputGroup}>
                <label>Patient Name:</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  style={styles.borderInput}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={styles.borderInput}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Age:</label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  style={styles.borderInput}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Gender:</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={styles.borderInput}
                  disabled={readOnly}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Weight:</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  style={styles.borderInput}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div style={styles.textAreaGroup}>
              <label>Diagnosis:</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                style={styles.borderLineTextarea}
                rows={2}
                disabled={readOnly}
              />
            </div>

            <div style={styles.textAreaGroup}>
              <label>Prescription / Medicines:</label>
              <textarea
                name="medicines"
                value={formData.medicines}
                onChange={handleChange}
                style={styles.textArea}
                rows={4}
                placeholder="Rx"
                disabled={readOnly}
              />
            </div>

            <div style={styles.textAreaGroup}>
              <label>Doctor's Instructions:</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                style={styles.textArea}
                rows={2}
                disabled={readOnly}
              />
            </div>
          </form>

          {/* Footer Section */}
          <div style={styles.footer}>
            <div style={styles.signature}>
              <div style={styles.signatureLine}></div>
              <p>Signature</p>
            </div>
          </div>
          
          <div style={styles.bottomBar}>
            <div style={styles.bottomContact}>
              📞 +91 9123456789
            </div>
          </div>
          
          <div style={styles.watermark}>⚕</div>
        </div>

        {/* Actions inside Modal but outside printable area */}
        <div className="no-print" style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={onClose} type="button">
            {readOnly ? "Close" : "Cancel"}
          </button>
          <button style={styles.secondaryBtn} onClick={handlePrint} className="no-print" type="button">
            Print / Download
          </button>
          {!readOnly && (
            <button type="submit" form="prescription-form" style={styles.primaryBtn}>
              Save Prescription
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            input, textarea {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              background: transparent !important;
              resize: none;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContainer: {
    width: "100%",
    maxWidth: "800px",
    background: "#f1f5f9",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 32px 80px rgba(15,23,42,0.2)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxHeight: "95vh",
    overflowY: "auto",
  },
  closeBtn: {
    position: "absolute",
    top: "30px",
    right: "30px",
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  prescriptionPaper: {
    background: "#fff",
    width: "100%",
    minHeight: "850px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    id: "print-area",
  },
  header: {
    position: "relative",
    padding: "40px 40px",
    textAlign: "center",
    color: "#fff",
  },
  headerShape: {
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: "140px",
    background: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
    clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
    zIndex: 1,
  },
  headerContent: {
    position: "relative",
    zIndex: 2,
    marginTop: "10px",
  },
  doctorName: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  qualification: {
    margin: "5px 0 0",
    fontSize: "14px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    opacity: 0.9,
  },
  logoText: {
    position: "absolute",
    top: "30px",
    left: "40px",
    fontSize: "24px",
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: "1.5px",
    zIndex: 10,
  },
  body: {
    padding: "40px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    position: "relative",
    zIndex: 2,
  },
  patientInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 30px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    fontSize: "14px",
    color: "#475569",
    fontWeight: "600",
  },
  borderInput: {
    flex: 1,
    border: "none",
    borderBottom: "1px solid #cbd5e1",
    padding: "4px 8px",
    fontSize: "15px",
    color: "#1e293b",
    background: "transparent",
    outline: "none",
  },
  textAreaGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#475569",
    fontWeight: "600",
  },
  borderLineTextarea: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #cbd5e1",
    padding: "8px",
    fontSize: "15px",
    color: "#1e293b",
    background: "transparent",
    outline: "none",
    resize: "none",
    lineHeight: "1.6",
  },
  textArea: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    color: "#1e293b",
    background: "#f8fafc",
    outline: "none",
    resize: "vertical",
    minHeight: "80px",
  },
  footer: {
    padding: "20px 40px 60px",
    display: "flex",
    justifyContent: "flex-end",
    position: "relative",
    zIndex: 2,
  },
  signature: {
    textAlign: "center",
  },
  signatureLine: {
    width: "180px",
    borderBottom: "1px solid #0f172a",
    marginBottom: "8px",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "linear-gradient(90deg, #06b6d4, #0ea5e9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  },
  bottomContact: {
    background: "#fff",
    padding: "8px 24px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transform: "translateY(-50%)",
    marginTop: "20px",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "300px",
    color: "rgba(226, 232, 240, 0.3)",
    zIndex: 1,
    pointerEvents: "none",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "10px",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#fff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default PrescriptionModal;
