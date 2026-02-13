const Food = require("../models/Food");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Audit = require("../models/Audit");

// Create Food Listing
exports.createFood = async (req, res) => {
    try {
        const { foodType, quantity, preparationTime, pickupLocation, description } = req.body;

        const food = await Food.create({
            donorId: req.user.id,
            foodType,
            quantity,
            preparationTime,
            pickupLocation,
            description,
        });

        // Notify all NGOs
        const ngos = await User.find({ role: "NGO" });

        for (let ngo of ngos) {
            await Notification.create({
                recipientId: ngo._id,
                message: `New food posted: ${food.foodType} at ${food.pickupLocation}`,
            });
        }

        const io = req.app.get("io");
        io.emit("newFood", {
            message: `New food posted: ${food.foodType}`,
        });

        res.status(201).json({ message: "Food posted successfully", food });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Available Food
exports.getFoods = async (req, res) => {
    try {
        const foods = await Food.find().populate("donorId", "name location");
        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Food Status (Locking Included)
// Update Food Status (Locking Included)
exports.updateFoodStatus = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        const { action } = req.body;

        // NGO Accepts Food
        if (action === "accept") {
            if (food.status !== "Available") {
                return res.status(400).json({ message: "Food already processed" });
            }

            food.status = "Accepted";
            await food.save();

            await Notification.create({
                recipientId: food.donorId,
                message: "Your food has been accepted by an NGO.",
            });

            await Audit.create({
                userId: req.user.id,
                action: "Food Accepted",
                details: `Food ID: ${food._id}`,
            });

            const io = req.app.get("io");
            io.emit("foodAccepted", {
                message: "Food has been accepted.",
            });

            return res.status(200).json({ message: "Food accepted", food });
        }

        // NGO Marks Collected
        if (action === "collect") {
            if (food.status !== "Accepted") {
                return res.status(400).json({ message: "Food must be accepted first" });
            }

            food.status = "Collected";
            await food.save();

            await Notification.create({
                recipientId: food.donorId,
                message: "Your food has been successfully collected.",
            });

            await Audit.create({
                userId: req.user.id,
                action: "Food Collected",
                details: `Food ID: ${food._id}`,
            });

            const io = req.app.get("io");
            io.emit("foodCollected", {
                message: "Food has been collected.",
            });

            return res.status(200).json({ message: "Food collected", food });
        }

        res.status(400).json({ message: "Invalid action" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
