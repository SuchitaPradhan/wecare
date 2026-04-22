const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllAppointments,
  addRemark,
  addFeedback
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Patient creates appointment
router.post("/", authMiddleware, createAppointment);

// Patient gets their own appointments
router.get("/my", authMiddleware, getMyAppointments);

// Doctor gets their assigned appointments
router.get("/doctor", authMiddleware, roleMiddleware("doctor"), getDoctorAppointments);

// Doctor or Admin updates appointment status
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("doctor", "admin"),
  updateAppointmentStatus
);

// Admin gets all appointments
router.get("/all", authMiddleware, roleMiddleware("admin"), getAllAppointments);

// Doctor adds remark
router.put("/:id/remark", authMiddleware, roleMiddleware("doctor"), addRemark);

// Patient adds feedback
router.post("/:id/feedback", authMiddleware, roleMiddleware("patient"), addFeedback);

module.exports = router;
