const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		phone: { type: String },
		reason: { type: String, required: true },
		message: { type: String, required: true },
		screenshots: [{ type: String, required: true }],
		status: { type: String, enum: ["resolved", "unresolved"], default: "unresolved" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Support", supportSchema);
