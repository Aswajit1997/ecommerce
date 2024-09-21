const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	value: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
});

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		price: { type: Number, required: true },
		description: { type: String, required: true },
		discount: { type: Number, min: 0, max: 100, default: 0 },
		discountedPrice: { type: Number },
		rating: [ratingSchema],
		averageRating: { type: Number, default: 0 },
		newArrival: { type: Boolean, default: false },
		bestDealProduct: { type: Boolean, default: false },
		brand: { type: String },
		ram: { type: String },
		internalStorage: { type: String },
		battery: { type: String },
		screenSize: { type: String },
		primaryCamera: { type: String },
		secondaryCamera: { type: String },
		netWorkType: { type: String },
		color: [{ type: String }],
		smartTv: { type: Boolean },
		resolution: { type: String },
		offers: { type: String },
		pattern: { type: String },
		size: { type: String },
		occasion: { type: String },
		fabric: { type: String },
		productImages: [{ type: String, required: true }],
		category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
		subCategory: { type: String, required: true },
		availableCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
	},
	{
		timestamps: true,
	}
);

productSchema.methods.calculateAverageRating = function () {
	if (this.rating.length > 0) {
		const total = this.rating.reduce((sum, r) => sum + r.value, 0);
		this.averageRating = total / this.rating.length;
	} else {
		this.averageRating = 0;
	}
};

productSchema.pre("save", function (next) {
	this.calculateAverageRating();
	this.discountedPrice = this.price - (this.price * this.discount) / 100;
	next();
});

module.exports = mongoose.model("Product", productSchema);
