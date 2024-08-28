const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");

const cartControllers = {};

// Add a product to the cart
cartControllers.addToCart = async (req, res) => {
	try {
		let { productId, quantity } = req.body;
		const userId = req.authID;

		quantity = quantity ? quantity : 1;

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

				// Recalculate couponDiscountedPrice if a coupon is applied
				if (productItem.appliedCoupon._id) {
					console.log(product.appliedCoupon, "sdkdke")
					const coupon = await Coupon.findById(productItem.appliedCoupon._id);
					const discount = (product.discountedPrice * coupon.discount) / 100;
					productItem.couponDiscountedPrice = (product.discountedPrice - discount) * productItem.quantity;
				}

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

// Apply a coupon to a product in the cart
cartControllers.applyCoupon = async (req, res) => {
	try {
		const { productId, couponCode } = req.body;
		const userId = req.authID;

		if (!productId || !couponCode) {
			return res.status(400).send({ status: false, msg: "Product ID and Coupon code are required." });
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		const coupon = await Coupon.findOne({ code: couponCode });
		if (!coupon) {
			return res.status(404).send({ status: false, msg: "Coupon not available." });
		}

		// Check coupon validity
		if (!coupon.isActive) {
			return res.status(400).send({ status: false, msg: "Coupon is not active." });
		}

		if (coupon.expirationDate < Date.now()) {
			return res.status(400).send({ status: false, msg: "Coupon has expired." });
		}

		// Check if the coupon is applicable to the product
		if (!product.availableCoupons.includes(coupon._id)) {
			return res.status(400).send({ status: false, msg: "Coupon is not applicable to this product." });
		}

		let cart = await Cart.findOne({ userId });
		if (!cart) {
			return res.status(404).send({ status: false, msg: "Cart not found." });
		}

		const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
		if (productIndex > -1) {
			let productItem = cart.products[productIndex];

			if (productItem.appliedCoupon) {
				// Apply or replace the coupon
				const discount = (product.discountedPrice * coupon.discount) / 100;
				const couponDiscountedPrice = (product.discountedPrice - discount) * productItem.quantity;

				productItem.appliedCoupon = {
					_id: coupon._id,
					code: coupon.code,
					discount: coupon.discount,
				};
				productItem.couponDiscountedPrice = couponDiscountedPrice;

				cart.products[productIndex] = productItem;
			} else {
				productItem.appliedCoupon = null;
				productItem.couponDiscountedPrice = null;

				cart.products[productIndex] = productItem;
			}

			await cart.save();

			return res.status(200).send({ status: true, msg: "Coupon applied successfully.", data: cart });
		} else {
			return res.status(404).send({ status: false, msg: "Product not found in cart." });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};


//remove a coupon
cartControllers.removeCoupon = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.authID;

		if (!productId) {
			return res.status(400).send({ status: false, msg: "Product ID is required." });
		}

		let cart = await Cart.findOne({ userId });
		if (!cart) {
			return res.status(404).send({ status: false, msg: "Cart not found." });
		}

		const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
		if (productIndex > -1) {
			let productItem = cart.products[productIndex];

			// Remove the coupon
			productItem.appliedCoupon = null;
			productItem.couponDiscountedPrice = null;

			cart.products[productIndex] = productItem;

			await cart.save();

			return res.status(200).send({ status: true, msg: "Coupon removed successfully.", data: cart });
		} else {
			return res.status(404).send({ status: false, msg: "Product not found in cart." });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

//update a product quantity in the cart
cartControllers.updateProductQuantity = async (req, res) => {
	try {
		const { productId, quantity } = req.body;
		const userId = req.authID;

		if (!productId || !quantity) {
			return res.status(400).send({ status: false, msg: "Product ID and quantity are required." });
		}

		let cart = await Cart.findOne({ userId });

		if (cart) {
			const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
			if (productIndex > -1) {
				let productItem = cart.products[productIndex];
				productItem.quantity = quantity;
				cart.products[productIndex] = productItem;
				await cart.save();
				return res.status(200).send({ status: true, msg: "Product quantity updated successfully.", data: cart });
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
module.exports = cartControllers;

// cartControllers.addToCart = async (req, res) => {
// 	try {
// 		let { productId, quantity } = req.body;
// 		const userId = req.authID;

// 		quantity = quantity ? quantity : 1;

// 		if (!productId) {
// 			return res.status(400).send({ status: false, msg: "Product ID is required." });
// 		}

// 		const product = await Product.findById(productId);
// 		if (!product) {
// 			return res.status(404).send({ status: false, msg: "Product not found." });
// 		}

// 		let cart = await Cart.findOne({ userId });

// 		if (cart) {
// 			const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
// 			if (productIndex > -1) {
// 				let productItem = cart.products[productIndex];
// 				productItem.quantity += quantity;
// 				cart.products[productIndex] = productItem;
// 			} else {
// 				cart.products.push({ productId, quantity });
// 			}
// 		} else {
// 			cart = await Cart.create({ userId, products: [{ productId, quantity }] });
// 		}

// 		await cart.save();

// 		return res.status(200).send({ status: true, msg: "Product added to cart successfully.", data: cart });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).send({ status: false, msg: error.message });
// 	}
// };
