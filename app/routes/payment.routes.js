const auth = require("../middleware/auth.js");
module.exports = (router) => {
	const paymentControllers = require("../controllers/payment.controller.js");
	router.get("/payments", auth.adminAccess(), paymentControllers.getPaymentHistory);
};
