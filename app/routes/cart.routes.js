const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const cartControllers = require("../controllers/cart.controller.js");

	router.post("/cart/add", auth.grantAccess(), cartControllers.addToCart);
	router.post("/cart/remove", auth.grantAccess(), cartControllers.removeFromCart);
	router.get("/cart", auth.grantAccess(), cartControllers.getCart);
	router.post("/applyCoupon", auth.grantAccess(), cartControllers.applyCoupon);
	router.post("/removeCoupon/:productId", auth.grantAccess(), cartControllers.removeCoupon);
};
