const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const cartControllers = {};

// Add a product to the cart
cartControllers.addToCart = async (req, res) => {
	try {
		let { productId, quantity } = req.body;
		const userId = req.authID;

		quantity=quantity ? quantity : 1;

		if (!productId) {
			return res.status(400).send({ status: false, msg: "Product ID is required." });
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
		const { productId } = req.body;
		const userId = req.authID;

		if (!productId) {
			return res.status(400).send({ status: false, msg: "Product ID is required." });
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
			return res.status(404).send({ status: false, msg: "Your Cart is Empty..." });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get cart items for a user
cartControllers.getCart = async (req, res) => {
	try {
		const userId = req.authID;

		const cart = await Cart.findOne({ userId }).populate(
			"products.productId",
			"name price description productImages averageRating discountedPrice"
		);

		if (!cart) {
			return res.status(200).send({ status: true, msg: "Your Cart is empty" });
		}

		return res.status(200).send({ status: true, msg: "Cart fetched successfully.", data: cart });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = cartControllers;
