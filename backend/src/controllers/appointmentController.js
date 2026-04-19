const Appointment = require("../models/Appointment");
const User = require("../models/user");
const Feedback = require("../models/Feedback");

// ── CREATE APPOINTMENT (Patient) ──────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    const { doctor, doctorName, specialty, date, time, type, notes, hospital } = req.body;

    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctor || null,
      patientName: patient.name,
      patientEmail: patient.email,
      doctorName: doctorName || "Any Available Doctor",
      specialty,
      date,
      time,
      type: type || "offline",
      notes: notes || "",
      hospital: hospital || "",
      status: "Upcoming",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY APPOINTMENTS (Patient) ─────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name email specialty hospital")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET DOCTOR APPOINTMENTS (Doctor) ──────────────────────
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE APPOINTMENT STATUS (Doctor / Admin) ────────────
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Upcoming", "Confirmed", "Completed", "Cancelled", "Pending"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL APPOINTMENTS (Admin) ──────────────────────────
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone")
      .populate("doctor", "name email specialty hospital")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── ADD REMARK (Doctor) ───────────────────────────────────
exports.addRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Ensure only the assigned doctor can add a remark
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to remark on this appointment" });
    }

    appointment.remark = remark;
    await appointment.save();

    res.json({ message: "Remark added successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── ADD FEEDBACK (Patient) ────────────────────────────────
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Validate patient
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to feedback on this appointment" });
    }

    if (!appointment.doctor) {
      return res.status(400).json({ message: "No doctor assigned to this appointment" });
    }

    const feedback = await Feedback.create({
      appointment: appointment._id,
      patient: req.user.id,
      doctor: appointment.doctor,
      rating,
      comment,
      title: title || "",
    });

    res.json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
