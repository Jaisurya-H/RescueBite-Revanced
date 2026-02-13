const express = require("express");
const { getDashboardStats } = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Only Admin can access dashboard
router.get("/dashboard", protect, authorizeRoles("Admin"), getDashboardStats);

module.exports = router;
