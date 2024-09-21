const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const bestDealController = require("../controllers/bestDeal.controller");

	// Route to create a new Best Deal
	router.post("/bestDeal", auth.adminAccess(), bestDealController.createBestDeal);

	// Route to delete an existing Best Deal
	router.delete("/bestDeal/:id", auth.adminAccess(), bestDealController.deleteBestDeal);

	// Route to get all Best Deals
	router.get("/bestDeals", bestDealController.getAllBestDeals);

	// Route to update an existing Best Deal
	router.put("/bestDeal/:id", auth.adminAccess(), bestDealController.updateBestDeal);
};
