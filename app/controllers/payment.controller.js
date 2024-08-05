const Payment = require("../models/payment.model");

const paymentControllers = {};

// Get payment history for a user
paymentControllers.getPaymentHistory = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const payments = await Payment.find()
			.populate("userId", "name email") 
			.sort({ paymentDate: -1 })
			.skip(skip)
			.limit(limit);

		const totalPayments = await Payment.countDocuments();

		return res.status(200).send({
			status: true,
			msg: "Payment history fetched successfully.",
			totalPayments,
			totalPages: Math.ceil(totalPayments / limit),
			currentPage: page,
			data: payments,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = paymentControllers;
