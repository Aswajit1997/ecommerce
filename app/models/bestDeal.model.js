const mongoose = require("mongoose");
const Product = require("./product.model");

const bestDealSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		validTill: {
			type: Date,
			required: true,
		},
		discountPercentage: {
			type: Number,
			min: 0,
			max: 100,
			required: true,
		},
		originalDiscount: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Middleware to update the product's discount and set bestDealProduct flag when a BestDeal is created or updated
bestDealSchema.pre("save", async function (next) {
	try {
		const product = await Product.findById(this.productId);
		if (!product) {
			return next(new Error("Product not found"));
		}

		// Store the original discount in the best deal
		if (this.isNew) {
			this.originalDiscount = product.discount || 0;
		}

		product.discount = this.discountPercentage;
		product.discountedPrice = product.price - (product.price * product.discount) / 100;
		product.bestDealProduct = true;

		await product.save();
		next();
	} catch (error) {
		next(error);
	}
});

module.exports = mongoose.model("BestDeal", bestDealSchema);
