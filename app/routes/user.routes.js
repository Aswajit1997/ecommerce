const upload = require("../config/multer");
const auth = require("../middleware/auth.js");
module.exports = (router) => {
	const userController = require("../controllers/user.controller.js");

	//new api User
	router.post("/user/register", userController.create);
	router.post("/user/login", userController.login);
	router.post("/user/verify-otp", userController.verifyOtp);

	router.put("/user/update", auth.grantAccess(), upload.single("profilePic"), userController.update);
	router.get("/users", auth.adminAccess(), userController.getAllUsers);
	router.get("/user-details", auth.grantAccess(), userController.getUserDetails);
};
