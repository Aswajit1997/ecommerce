const Payment = require("../models/payment.model");

const paymentControllers = {};

// Get payment history for a user with pagination and date filters
paymentControllers.getPaymentHistory = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		const { startDate, endDate } = req.query;

		const filter = {};
		if (startDate && startDate !== "null") {
			filter.paymentDate = { $gte: new Date(startDate) };
		}
		if (endDate && endDate !== "null") {
			const endOfDay = new Date(endDate);
			endOfDay.setHours(23, 59, 59, 999);
			if (!filter.paymentDate) {
				filter.paymentDate = {};
			}
			filter.paymentDate.$lte = endOfDay;
		}

		const payments = await Payment.find(filter)
			.populate("userId", "name email")
			.sort({ paymentDate: -1 })
			.skip(skip)
			.limit(limit);

		const totalPayments = await Payment.countDocuments(filter);

		const totalRevenue = await Payment.aggregate([
			{ $match: filter },
			{ $group: { _id: null, totalRevenue: { $sum: "$orderTotal" } } },
		]);

		console.log(totalRevenue);

		return res.status(200).send({
			status: true,
			msg: "Payment history fetched successfully.",
			totalPayments,
			totalPages: Math.ceil(totalPayments / limit),
			currentPage: page,
			data: payments,
			totalRevenue: totalRevenue.length ? totalRevenue[0].totalRevenue : 0,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = paymentControllers;
