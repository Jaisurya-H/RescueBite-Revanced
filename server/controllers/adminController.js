const User = require("../models/User");
const Food = require("../models/Food");

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFood = await Food.countDocuments();

        const availableFood = await Food.countDocuments({ status: "Available" });
        const acceptedFood = await Food.countDocuments({ status: "Accepted" });
        const collectedFood = await Food.countDocuments({ status: "Collected" });

        const recentFood = await Food.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("donorId", "name");

        res.status(200).json({
            totalUsers,
            totalFood,
            availableFood,
            acceptedFood,
            collectedFood,
            recentFood,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
