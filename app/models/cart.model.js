const mongoose = require("mongoose");
const Product = require("./product.model");
const Coupon = require("./coupon.model");

const cartSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		products: [
			{
				productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
				quantity: { type: Number, required: true, default: 1 },
				itemPrice: { type: Number },
				couponDiscountedPrice: { type: Number }, 
				appliedCoupon: {
					_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
					code: { type: String },
					discount: { type: Number },
				},
			},
		],
		totalPrice: { type: Number },
	},
	{
		timestamps: true,
	}
);

cartSchema.pre("save", async function (next) {
	const cart = this;

	// Calculate itemPrice for each product
	for (const item of cart.products) {
		const product = await Product.findById(item.productId);
		if (product) {
			item.itemPrice = product.discountedPrice * item.quantity;
		}
	}

	// Calculate totalPrice
	cart.totalPrice = cart.products.reduce((sum, item) => {
		return sum + (item.couponDiscountedPrice || item.itemPrice); 
	}, 0);

	next();
});



module.exports = mongoose.model("Cart", cartSchema);
