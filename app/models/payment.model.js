const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
	{
		orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		orderTotal: { type: Number, required: true },
		totalRevenue: { type: Number},
		paymentDate: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Payment", paymentSchema);
