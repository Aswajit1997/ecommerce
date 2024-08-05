const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Payment = require("../models/payment.model");
const mongoose = require("mongoose");

const orderControllers = {};

// Create a new order from the cart
orderControllers.create = async (req, res) => {
	try {
		const userId = req.authID;

		const cart = await Cart.findOne({ userId });
		if (!cart || cart.products.length === 0) {
			return res.status(400).send({ status: false, msg: "Cart is empty." });
		}

		// Create a new payment record
		const newPayment = await Payment.create({
			orderId: new mongoose.Types.ObjectId(), // Generate a temporary ObjectId for the order
			userId,
			orderTotal: cart.totalPrice,
		});

		const newOrder = await Order.create({
			userId,
			products: cart.products.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				itemPrice: item.itemPrice,
				status: "Ordered",
				statusHistory: [{ status: "Ordered" }],
			})),
			totalPrice: cart.totalPrice,
			status: "Ordered",
		});

		// Update the payment record with the actual orderId
		newPayment.orderId = newOrder._id;
		await newPayment.save();

		cart.products = [];
		cart.totalPrice = 0;
		await cart.save();

		return res.status(200).send({ status: true, msg: "Order created successfully.", data: newOrder });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get order history for a particular product (admin only)
orderControllers.getOrderHistory = async (req, res) => {
	try {
		const { productId } = req.params;

		const orders = await Order.find({ "products.productId": productId });

		return res.status(200).send({ status: true, msg: "Order history fetched successfully.", data: orders });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get all orders of a user
orderControllers.getAll = async (req, res) => {
	try {
		const orders = await Order.find({ userId: req.authID })
			.populate("products.productId", "name description productImages averageRating discountedPrice")
			.sort({ createdAt: -1 });

		return res.status(200).send({ status: true, msg: "Orders fetched successfully.", data: orders });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get all orders
orderControllers.getAllOrders = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		const statusFilter = req.query.status;

		const orders = await Order.find({})
			.populate("userId", "name email address city state profilePic pinCode")
			.populate("products.productId", "name description productImages averageRating discountedPrice ")
			.sort({ createdAt: -1 });

		let allProducts = orders.flatMap((order) =>
			order.products.map((product) => ({
				...product.productId.toObject(),
				status: product.status,
				quantity: product.quantity,
				itemPrice: product.itemPrice,
				statusHistory: product.statusHistory,
				user: {
					id: order.userId._id,
					name: order.userId.name,
					email: order.userId.email,
					profilePic: order.userId.profilePic,
					address: order.userId.address,
					city: order.userId.city,
					state: order.userId.state,
					pinCode: order.userId.pinCode,
				},
				orderDate: order.createdAt,
				orderId: order._id,
			}))
		);

		if (statusFilter) {
			allProducts = allProducts.filter((product) => product.status === statusFilter);
		}

		const totalData = allProducts.length;
		const paginatedProducts = allProducts.slice(skip, skip + limit);
		const totalPage = Math.ceil(totalData / limit);

		return res.status(200).send({
			status: true,
			msg: "Orders fetched successfully.",
			totalData,
			totalPage,
			currentPage: page,
			data: paginatedProducts,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Update order status for a specific product in an order
orderControllers.updateStatus = async (req, res) => {
	try {
		const { orderId, productId, status } = req.body;

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).send({ status: false, msg: "Order not found." });
		}

		const productIndex = order.products.findIndex((p) => p.productId.toString() === productId);
		if (productIndex === -1) {
			return res.status(404).send({ status: false, msg: "Product not found in order." });
		}

		order.products[productIndex].status = status;
		order.products[productIndex].statusHistory.push({ status });

		await order.save();

		return res.status(200).send({ status: true, msg: "Order status updated successfully.", data: order });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = orderControllers;
