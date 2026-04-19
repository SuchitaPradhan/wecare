const User = require("../models/user");
const Appointment = require("../models/Appointment");

// ── DASHBOARD STATS (Admin) ──────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();

    // Today's appointments
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const todaysAppointments = await Appointment.countDocuments({ date: todayStr });

    // Income stats
    const paidAppointments = await Appointment.find({ paymentStatus: "Paid" });
    const totalRevenue = paidAppointments.reduce((sum, a) => sum + (a.fee || 0), 0);

    const pendingAppointments = await Appointment.countDocuments({ status: "Upcoming" });
    const completedAppointments = await Appointment.countDocuments({ status: "Completed" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "Cancelled" });

    // Available doctors
    const availableDoctors = await User.countDocuments({ role: "doctor", isAvailable: true });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      todaysAppointments,
      totalRevenue,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      availableDoctors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL USERS (Admin) ────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE USER (Admin) ──────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
