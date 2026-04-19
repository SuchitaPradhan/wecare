const User = require("../models/user");

// ── GET ALL DOCTORS (Public) ──────────────────────────────
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET SINGLE DOCTOR (Public) ────────────────────────────
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

// ── UPDATE DOCTOR PROFILE (Doctor Only) ───────────────────
exports.updateDoctorProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name", "phone", "specialty", "qualification",
      "experience", "hospital", "city", "shifts",
      "languages", "rating", "isAvailable",
    ];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const doctor = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
