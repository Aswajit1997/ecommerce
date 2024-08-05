const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const addressControllers = require("../controllers/address.controller");

	router.get("/addresses", auth.grantAccess(), addressControllers.getAll);
	router.post("/addresses", auth.grantAccess(), addressControllers.add);
	router.delete("/addresses/:addressId", auth.grantAccess(), addressControllers.delete);
	router.put("/addresses/select/:addressId", auth.grantAccess(), addressControllers.setSelectedAddress);
	router.put("/addresses/:addressId", auth.grantAccess(), addressControllers.edit);
};
