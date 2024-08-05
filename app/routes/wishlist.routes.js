const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const wishlistControllers = require("../controllers/wishlist.controller.js");

	router.post("/wishlist/add", auth.grantAccess(), wishlistControllers.add);
	router.post("/wishlist/remove", auth.grantAccess(), wishlistControllers.remove);
	router.get("/wishlist", auth.grantAccess(), wishlistControllers.getAll);
	router.post("/wishlist/move-to-cart", auth.grantAccess(), wishlistControllers.moveToCart);
};
