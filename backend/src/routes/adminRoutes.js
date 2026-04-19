const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
