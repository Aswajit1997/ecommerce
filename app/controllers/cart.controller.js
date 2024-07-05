const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const cartControllers = {};

// Add a product to the cart
cartControllers.addToCart = async (req, res) => {
	try {
		const { userId, productId, quantity } = req.body;

		if (!userId || !productId) {
			return res.status(400).send({ status: false, msg: "User ID and Product ID are required." });
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		let cart = await Cart.findOne({ userId });

		if (cart) {
			const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
			if (productIndex > -1) {
				let productItem = cart.products[productIndex];
				productItem.quantity += quantity;
				cart.products[productIndex] = productItem;
			} else {
				cart.products.push({ productId, quantity });
			}
		} else {
			cart = await Cart.create({ userId, products: [{ productId, quantity }] });
		}

		await cart.save();

		return res.status(200).send({ status: true, msg: "Product added to cart successfully.", data: cart });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Remove a product from the cart
cartControllers.removeFromCart = async (req, res) => {
	try {
		const { userId, productId } = req.body;

		if (!userId || !productId) {
			return res.status(400).send({ status: false, msg: "User ID and Product ID are required." });
		}

		let cart = await Cart.findOne({ userId });

		if (cart) {
			const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
			if (productIndex > -1) {
				cart.products.splice(productIndex, 1);
				await cart.save();
				return res.status(200).send({ status: true, msg: "Product removed from cart successfully.", data: cart });
			} else {
				return res.status(404).send({ status: false, msg: "Product not found in cart." });
			}
		} else {
			return res.status(404).send({ status: false, msg: "Cart not found." });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get cart items for a user
cartControllers.getCart = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return res.status(400).send({ status: false, msg: "User ID is required." });
		}

		const cart = await Cart.findOne({ userId }).populate("products.productId", "name price description");

		if (!cart) {
			return res.status(404).send({ status: false, msg: "Cart not found." });
		}

		return res.status(200).send({ status: true, msg: "Cart fetched successfully.", data: cart });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = cartControllers;
