const auth = require("../middleware/auth.js");
const upload = require("../config/multer");
module.exports = (router) => {
	const productControllers = require("../controllers/product.controller.js");

	// Create a new product
	router.post("/product", auth.grantAccess(), upload.array("productImages", 10), productControllers.create);

	// Delete a product
	router.delete("/product/:id", auth.grantAccess(), productControllers.delete);

	// Get all products with pagination
	router.get("/productsByCategory", productControllers.getByCategory);
	router.get("/products", productControllers.getAll);
};
