const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        action: {
            type: String,
            required: true,
        },
        details: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Audit", auditSchema);
