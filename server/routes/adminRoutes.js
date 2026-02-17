const express = require("express");
const User = require("../models/User");
const Food = require("../models/Food");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/dashboard", protect, authorize("Admin"), async (req, res) => {
    try {
        const users = await User.countDocuments();
        const foods = await Food.countDocuments();
        const collected = await Food.countDocuments({ status: "Collected" });

        res.json({ users, foods, collected });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
