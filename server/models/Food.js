const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
    {
        title: String,
        quantity: String,
        location: String,
        description: String,

        status: {
            type: String,
            enum: ["Available", "Accepted", "Collected"],
            default: "Available",
        },

        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
