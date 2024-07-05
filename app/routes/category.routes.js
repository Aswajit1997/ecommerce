const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const categoryControllers = require("../controllers/category.controller.js");

	// Category routes
	router.post("/category", auth.grantAccess(), categoryControllers.create);
	router.delete("/category/:id", auth.grantAccess(), categoryControllers.delete);
	router.get("/categories", categoryControllers.getAll);
	router.get("/categories/array", categoryControllers.getCategoryArray);
	router.put("/category/:id", auth.grantAccess(), categoryControllers.update);
};
