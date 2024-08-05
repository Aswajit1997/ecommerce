const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	value: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
});

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		price: { type: Number, required: true },
		description: { type: String, required: true, default: "" },
		discount: { type: Number, min: 0, max: 100, default: 0 },
		discountedPrice: { type: Number },
		rating: [ratingSchema],
		averageRating: { type: Number, default: 0 },
		brand: { type: String, default: "" },
		color: [{ type: String }],
		offers: { type: String, default: "" },
		pattern: { type: String, default: "" },
		size: { type: String, default: "" },
		occasion: { type: String, default: "" },
		fabric: { type: String, default: "" },
		productImages: [{ type: String, required: true }],
		category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
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
