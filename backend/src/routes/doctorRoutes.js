const express = require("express");
const router = express.Router();

const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// Doctor updates own profile
router.put("/profile", authMiddleware, roleMiddleware("doctor"), updateDoctorProfile);

module.exports = router;
