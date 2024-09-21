const BestDeal = require("../models/bestDeal.model");
const Product = require("../models/product.model");
const mongoose = require("mongoose");
const moment = require("moment");

const bestDealControllers = {};

bestDealControllers.createBestDeal = async (req, res) => {
	try {
		const { productId, validTill, discountPercentage } = req.body;

		// Validate product ID
		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send({ status: false, msg: "Invalid product ID." });
		}

		// Find the product by ID
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		// Create and save the BestDeal, setting the original discount
		const bestDeal = new BestDeal({
			productId,
			validTill,
			discountPercentage,
			originalDiscount: product.discount || 0,
		});

		await bestDeal.save();

		return res.status(200).send({
			status: true,
			msg: "Best Deal created successfully, and product discount updated.",
			data: bestDeal,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

bestDealControllers.deleteBestDeal = async (req, res) => {
	try {
		const { id } = req.params;

		const bestDeal = await BestDeal.findById(id);
		if (!bestDeal) {
			return res.status(404).send({ status: false, msg: "Best Deal not found." });
		}

		// Find the associated Product by ID
		const product = await Product.findById(bestDeal.productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		// Reset product discount to original discount and bestDealProduct flag
		product.discount = bestDeal.originalDiscount || 5;
		product.discountedPrice = product.price - (product.price * product.discount) / 100;
		product.bestDealProduct = false;

		await product.save();

		// Delete the BestDeal document
		await BestDeal.deleteOne({ _id: id });

		return res.status(200).send({ status: true, msg: "Best Deal deleted and product discount reset.", data: product });
	} catch (error) {
		console.error(error);
		// Send error response
		return res.status(500).send({ status: false, msg: error.message });
	}
};

bestDealControllers.getAllBestDeals = async (req, res) => {
	try {
		const bestDeals = await BestDeal.find().populate(
			"productId",
			"name price productImages description discount price discountedPrice"
		);
		return res.status(200).send({
			status: true,
			msg: "Best Deals fetched successfully.",
			data: bestDeals,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

bestDealControllers.updateBestDeal = async (req, res) => {
	try {
		const { id } = req.params;
		const { discountPercentage, validTill } = req.body;

		const bestDeal = await BestDeal.findById(id);
		if (!bestDeal) return res.status(404).send({ status: false, msg: "Best Deal not found." });

		const product = await Product.findById(bestDeal.productId);
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

		// Update the best deal fields
		if (discountPercentage !== undefined) bestDeal.discountPercentage = discountPercentage;
		if (validTill !== undefined) bestDeal.validTill = validTill;

		await bestDeal.save();

		// Also update the product discount and discounted price if needed
		if (discountPercentage !== undefined) {
			product.discount = discountPercentage;
			product.discountedPrice = product.price - product.price * (discountPercentage / 100);
			await product.save();
		}

		return res.status(200).send({
			status: true,
			msg: "Best Deal updated successfully.",
			data: bestDeal,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = bestDealControllers;
