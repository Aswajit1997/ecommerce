const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		price: { type: Number, required: true },
		description: { type: String, required: true, default: "" },
		discount: { type: Number },
		productImages: [{ type: String, required: true }],
		category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Product", productSchema);
