const auth = require("../middleware/auth.js");
const upload = require("../config/multer");
const couponControllers = require("../controllers/coupon.controller.js");

module.exports = (router) => {
	// Coupon routes
	router.get("/coupon", couponControllers.getAll);
	router.post("/coupon", auth.adminAccess(), couponControllers.create);
	router.delete("/coupon/:id", auth.adminAccess(), couponControllers.delete);
	router.put("/coupon/:id", auth.adminAccess(), couponControllers.edit);
};
