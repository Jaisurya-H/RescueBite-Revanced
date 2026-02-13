const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
    {
        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        foodType: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        preparationTime: {
            type: Date,
            required: true,
        },
        pickupLocation: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Available", "Accepted", "Collected"],
            default: "Available",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
