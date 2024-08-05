const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const ratingControllers = require("../controllers/rating.controller");

	// Add a rating
	router.post("/products/:productId/ratings", auth.grantAccess(), ratingControllers.addRating);

	// Update a rating
	router.put("/products/:productId/ratings", auth.grantAccess(), ratingControllers.updateRating);

	// Delete a rating
	router.delete("/products/:productId/ratings", auth.grantAccess(), ratingControllers.deleteRating);

	router.get("/products/:productId/ratings", ratingControllers.getRatings);
};
