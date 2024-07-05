

module.exports = (router) => {
	const userController = require("../controllers/user.controller.js");

	//new api User
	router.post("/user/register", userController.create);
	router.post("/user/login", userController.login);
	router.post("/user/verify-otp", userController.verifyOtp);
};
