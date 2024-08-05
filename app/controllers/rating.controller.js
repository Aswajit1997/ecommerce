const Product = require("../models/product.model");

const ratingControllers = {};

// Add a rating
ratingControllers.addRating = async (req, res) => {
	try {
		const { productId } = req.params;
		const { value } = req.body;
		const userId = req.authID;

		if (!value || ![1, 2, 3, 4, 5].includes(value)) {
			return res.status(400).send({ status: false, msg: "Please provide a valid rating value between 1 and 5." });
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		// Check if user has already rated the product
		const existingRating = product.rating.find((r) => r.userId.toString() === userId);
		if (existingRating) {
			return res.status(400).send({ status: false, msg: "You have already rated this product." });
		}

		product.rating.push({ userId, value });
		product.calculateAverageRating();
		await product.save();

		return res.status(200).send({ status: true, msg: "Rating added successfully.", data: product });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Update a rating
ratingControllers.updateRating = async (req, res) => {
	try {
		const { productId } = req.params;
		const { value } = req.body;
		const userId = req.authID;

		if (!value || ![1, 2, 3, 4, 5].includes(value)) {
			return res.status(400).send({ status: false, msg: "Please provide a valid rating value between 1 and 5." });
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		// Find the user's rating and update it
		const existingRating = product.rating.find((r) => r.userId.toString() === userId);
		if (!existingRating) {
			return res.status(404).send({ status: false, msg: "Rating not found." });
		}

		existingRating.value = value;
		product.calculateAverageRating();
		await product.save();

		return res.status(200).send({ status: true, msg: "Rating updated successfully.", data: product });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Delete a rating
ratingControllers.deleteRating = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.authID;

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		// Find the user's rating and remove it
		const ratingIndex = product.rating.findIndex((r) => r.userId.toString() === userId);
		if (ratingIndex === -1) {
			return res.status(404).send({ status: false, msg: "Rating not found." });
		}

		product.rating.splice(ratingIndex, 1);
		product.calculateAverageRating();
		await product.save();

		return res.status(200).send({ status: true, msg: "Rating deleted successfully.", data: product });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};


// Get all ratings for a product
ratingControllers.getRatings = async (req, res) => {
	try {
		const { productId } = req.params;

		const product = await Product.findById(productId).populate({
			path: "rating.userId",
			select: "name email",
		});
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		return res.status(200).send({ status: true, msg: "Ratings fetched successfully.", data: product.rating });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};


module.exports = ratingControllers;
