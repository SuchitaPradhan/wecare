const Appointment = require("../models/Appointment");
const User = require("../models/user");
const Feedback = require("../models/Feedback");

function getDefaultFee(type) {
  return type === "online" ? 1200 : 700;
}

exports.createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      doctorName,
      specialty,
      date,
      time,
      type,
      notes,
      hospital,
      fee,
      paymentStatus,
      paymentMethod,
      paymentReference,
    } = req.body;

    const appointmentType = type || "offline";

    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let selectedDoctor = null;
    if (doctor) {
      selectedDoctor = await User.findOne({ _id: doctor, role: "doctor" }).select(
        "name specialty hospital"
      );

      if (!selectedDoctor) {
        return res.status(404).json({ message: "Selected doctor not found" });
      }
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: selectedDoctor?._id || null,
      patientName: patient.name,
      patientEmail: patient.email,
      doctorName: selectedDoctor?.name || doctorName || "Any Available Doctor",
      specialty: selectedDoctor?.specialty || specialty,
      date,
      time,
      type: appointmentType,
      notes: notes || "",
      hospital: selectedDoctor?.hospital || hospital || "",
      status: "Upcoming",
      fee:
        Number.isFinite(Number(fee)) && Number(fee) > 0
          ? Number(fee)
          : getDefaultFee(appointmentType),
      paymentStatus:
        paymentStatus || (appointmentType === "online" ? "Paid" : "Pending"),
      paymentMethod:
        paymentMethod || (appointmentType === "online" ? "Online" : "In Person"),
      paymentReference: paymentReference || "",
    });

    res.status(201).json({
      message:
        appointmentType === "online"
          ? "Video consultation payment received and appointment booked successfully"
          : "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Upcoming", "Confirmed", "Completed", "Cancelled", "Pending"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!["doctor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    if (
      req.user.role === "doctor" &&
      appointment.doctor &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "You can only update your own appointments" });
    }

    if (req.user.role === "doctor" && !appointment.doctor) {
      appointment.doctor = req.user.id;
    }

    appointment.status = status;

    if (!appointment.fee || appointment.fee <= 0) {
      appointment.fee = getDefaultFee(appointment.type);
    }

    let message = "Appointment status updated successfully.";

    if (status === "Confirmed") {
      message = "The appointment is confirmed.";
    }

    if (status === "Completed") {
      if (appointment.type === "offline" && appointment.paymentStatus === "Pending") {
        appointment.paymentStatus = "Paid";
        appointment.paymentMethod = appointment.paymentMethod || "In Person";
      }
      message = "Appointment completed successfully.";
    }

    if (status === "Cancelled") {
      message = "Appointment cancelled successfully.";
    }

    await appointment.save();

    res.json({ message, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

exports.addRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appointment.doctor || appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to remark on this appointment" });
    }

    appointment.remark = remark;
    await appointment.save();

    res.json({ message: "Remark added successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

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
