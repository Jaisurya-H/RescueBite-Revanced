const express = require("express");
const Food = require("../models/Food");
const AuditLog = require("../models/AuditLog");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Create Food (Donor Only)
router.post("/", protect, authorize("Donor"), async (req, res) => {
    try {
        const food = await Food.create({
            ...req.body,
            donor: req.user.id,
        });
        res.status(201).json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Foods (All Authenticated Users)
router.get("/", protect, async (req, res) => {
    try {
        const foods = await Food.find()
            .populate("donor", "name email")
            .populate("acceptedBy", "name email");
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept Food (NGO Only)
router.put("/:id/accept", protect, authorize("NGO"), async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food || food.status !== "Available") {
            return res.status(400).json({ message: "Food not available" });
        }

        food.status = "Accepted";
        food.acceptedBy = req.user.id;
        await food.save();

        await AuditLog.create({
            user: req.user.id,
            action: "Food Accepted",
            food: food._id,
        });

        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark Collected (NGO Only)
router.put("/:id/collect", protect, authorize("NGO"), async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food || food.status !== "Accepted") {
            return res.status(400).json({ message: "Food not accepted yet" });
        }

        food.status = "Collected";
        await food.save();

        await AuditLog.create({
            user: req.user.id,
            action: "Food Collected",
            food: food._id,
        });

        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
