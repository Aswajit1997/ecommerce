const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		products: [
			{
				productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
				quantity: { type: Number, required: true },
				itemPrice: { type: Number, required: true },
				status: { type: String, enum: ["Ordered", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Ordered" },
				statusHistory: [
					{
						status: { type: String, enum: ["Ordered", "Packed", "Shipped", "Delivered", "Cancelled"] },
						changedAt: { type: Date, default: Date.now },
					},
				],
			},
		],
		totalPrice: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
