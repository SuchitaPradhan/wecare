const express = require("express");
const router = express.Router();

const { 
  register, login, getProfile, updateProfile,
  forgotPassword, resetPassword, updatePassword
} = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ───── Public routes ─────
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ───── Protected routes ─────
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/update-password", authMiddleware, updatePassword);

// ───── Role-based test routes ─────
router.get(
  "/patient",
  authMiddleware,
  roleMiddleware("patient"),
  (req, res) => {
    res.json({ message: "Patient route accessed" });
  }
);

router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("doctor"),
  (req, res) => {
    res.json({ message: "Doctor route accessed" });
  }
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: "Admin route accessed" });
  }
);

module.exports = router;