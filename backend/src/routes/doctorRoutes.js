const express = require("express");
const router = express.Router();

const {
  getAllDoctors,
  getDoctorSummary,
  getDoctorDashboard,
  getDoctorById,
  updateDoctorProfile,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public routes
router.get("/summary", getDoctorSummary);
router.get("/", getAllDoctors);
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorDashboard
);
router.get("/:id", getDoctorById);

// Doctor updates own profile
router.put("/profile", authMiddleware, roleMiddleware("doctor"), updateDoctorProfile);

module.exports = router;
