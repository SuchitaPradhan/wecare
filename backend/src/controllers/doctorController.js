const User = require("../models/user");
const Appointment = require("../models/Appointment");
const Feedback = require("../models/Feedback");

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorSummary = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "specialty city isAvailable"
    );

    const specialties = new Set();
    const cities = new Set();

    doctors.forEach((doctor) => {
      if (doctor.specialty) specialties.add(doctor.specialty);
      if (doctor.city) cities.add(doctor.city);
    });

    res.json({
      totalDoctors: doctors.length,
      availableDoctors: doctors.filter((doctor) => doctor.isAvailable).length,
      specialties: specialties.size,
      cities: cities.size,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("-password");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "specialty",
      "qualification",
      "experience",
      "hospital",
      "city",
      "shifts",
      "languages",
      "rating",
      "isAvailable",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const doctor = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select("-password");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate(
        "patient",
        "name email phone gender bloodGroup dob address emergencyContact"
      )
      .sort({ createdAt: -1 });

    const feedback = await Feedback.find({ doctor: req.user.id })
      .populate("patient", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const upcomingAppointments = appointments.filter((appointment) =>
      ["Upcoming", "Pending", "Confirmed"].includes(appointment.status)
    );
    const historyAppointments = appointments.filter((appointment) =>
      ["Completed", "Cancelled"].includes(appointment.status)
    );

    const followUpMap = new Map();
    historyAppointments.forEach((appointment) => {
      const patientId =
        appointment.patient?._id?.toString() || appointment.patientName;

      if (!followUpMap.has(patientId)) {
        followUpMap.set(patientId, {
          id: patientId,
          name: appointment.patient?.name || appointment.patientName,
          email: appointment.patient?.email || appointment.patientEmail,
          phone: appointment.patient?.phone || "",
          gender: appointment.patient?.gender || "",
          bloodGroup: appointment.patient?.bloodGroup || "",
          lastVisit: appointment.date,
          specialty: appointment.specialty,
          hospital: appointment.hospital,
          status: appointment.status,
          remark: appointment.remark || "",
        });
      }
    });

    const paymentHistory = appointments.map((appointment) => ({
      id: appointment._id,
      patientName: appointment.patient?.name || appointment.patientName,
      date: appointment.date,
      amount: appointment.fee || 0,
      service: `${appointment.specialty} ${
        appointment.type === "online" ? "Consultation" : "Visit"
      }`,
      status: appointment.paymentStatus,
    }));

    const totalRevenue = paymentHistory.reduce(
      (sum, item) => sum + (item.status === "Paid" ? item.amount : 0),
      0
    );
    const pendingRevenue = paymentHistory.reduce(
      (sum, item) => sum + (item.status === "Pending" ? item.amount : 0),
      0
    );

    res.json({
      doctor,
      stats: {
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: appointments.filter(
          (appointment) => appointment.status === "Completed"
        ).length,
        followUpPatients: followUpMap.size,
        totalRevenue,
        pendingRevenue,
      },
      upcomingAppointments,
      followUpPatients: Array.from(followUpMap.values()),
      paymentHistory,
      recentFeedback: feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
