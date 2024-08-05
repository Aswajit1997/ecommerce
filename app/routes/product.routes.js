const auth = require("../middleware/auth.js");
const upload = require("../config/multer");
module.exports = (router) => {
	const productControllers = require("../controllers/product.controller.js");

	// Create a new product
	router.post("/product", auth.adminAccess(), upload.array("productImages", 10), productControllers.create);

	// Delete a product
	router.delete("/product/:id", auth.adminAccess(), productControllers.delete);

	//update product
	router.put("/product/:id", auth.adminAccess(), upload.array("productImages", 10), productControllers.edit);

	// Get all products with pagination
	router.get("/productsByCategory", productControllers.getByCategory);
	router.get("/products", productControllers.getAll);
};
