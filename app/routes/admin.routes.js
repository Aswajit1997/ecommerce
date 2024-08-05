module.exports = (router) => {
	const adminController = require("../controllers/admin.controller.js");

	// New API Admin
	router.post("/admin/register", adminController.create);
	router.post("/admin/login", adminController.login);
	router.post("/admin/verify-otp", adminController.verifyOtp);
};
