const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const cartControllers = require("../controllers/cart.controller.js");

	router.post("/cart/add", cartControllers.addToCart);
	router.post("/cart/remove", cartControllers.removeFromCart);
	router.get("/cart/:userId", cartControllers.getCart);
};
