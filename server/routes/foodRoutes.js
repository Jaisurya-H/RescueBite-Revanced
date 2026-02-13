const express = require("express");
const { createFood, getFoods, updateFoodStatus } = require("../controllers/foodController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Only Donor can create food
router.post("/", protect, authorizeRoles("Donor"), createFood);

// All authenticated users can view food
router.get("/", protect, getFoods);

// Only NGO can accept food
router.put("/:id", protect, authorizeRoles("NGO"), updateFoodStatus);

module.exports = router;
