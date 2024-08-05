const Wishlist = require("../models/wishlist.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const wishlistControllers = {};

// Add product to wishlist
wishlistControllers.add = async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.authID;

		if (!productId) {
			return res.status(400).send({ status: false, msg: "Product ID is required." });
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		let wishlist = await Wishlist.findOne({ userId });

		if (!wishlist) {
			wishlist = await Wishlist.create({ userId, products: [{ productId }] });
		} else {
			const productExists = wishlist.products.find((item) => item.productId.toString() === productId);
			if (productExists) {
				return res.status(400).send({ status: false, msg: "Product already in wishlist." });
			}
			wishlist.products.push({ productId });
			await wishlist.save();
		}

		return res.status(200).send({ status: true, msg: "Product added to wishlist.", data: wishlist });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Remove product from wishlist
wishlistControllers.remove = async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.authID;

		if (!productId) {
			return res.status(400).send({ status: false, msg: "Product ID is required." });
		}

		const wishlist = await Wishlist.findOne({ userId });
		if (!wishlist) {
			return res.status(404).send({ status: false, msg: "Wishlist not found." });
		}

		const productIndex = wishlist.products.findIndex((item) => item.productId.toString() === productId);
		if (productIndex === -1) {
			return res.status(404).send({ status: false, msg: "Product not found in wishlist." });
		}

		wishlist.products.splice(productIndex, 1);
		await wishlist.save();

		return res.status(200).send({ status: true, msg: "Product removed from wishlist.", data: wishlist });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get all products in wishlist
wishlistControllers.getAll = async (req, res) => {
	try {
		const userId = req.authID;

		const wishlist = await Wishlist.findOne({ userId }).populate(
			"products.productId",
			"name price description productImages averageRating discountedPrice"
		);
		if (!wishlist) {
			return res.status(200).send({ status: true, msg: "Wishlist is empty" });
		}

		return res.status(200).send({ status: true, msg: "Wishlist fetched successfully.", data: wishlist.products });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Move product from wishlist to cart
wishlistControllers.moveToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.authID;

		if (!productId) {
			return res.status(400).send({ status: false, msg: "Product ID is required." });
		}

		const wishlist = await Wishlist.findOne({ userId });
		if (!wishlist) {
			return res.status(404).send({ status: false, msg: "Wishlist not found." });
		}

		const productIndex = wishlist.products.findIndex((item) => item.productId.toString() === productId);
		if (productIndex === -1) {
			return res.status(404).send({ status: false, msg: "Product not found in wishlist." });
		}

		let cart = await Cart.findOne({ userId });
		if (!cart) {
			cart = await Cart.create({ userId, products: [{ productId, quantity: 1 }] });
		} else {
			const productInCart = cart.products.find((item) => item.productId.toString() === productId);
			if (productInCart) {
				productInCart.quantity += 1;
			} else {
				cart.products.push({ productId, quantity: 1 });
			}
		}
		await cart.save();

		wishlist.products.splice(productIndex, 1);
		await wishlist.save();

		return res.status(200).send({ status: true, msg: "Product moved to cart.", data: { cart, wishlist } });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = wishlistControllers;
