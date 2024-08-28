const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const categoryControllers = require("../controllers/category.controller.js");

	// Category routes
	router.post("/category", auth.adminAccess(), categoryControllers.create);
	router.delete("/category/:id", auth.adminAccess(), categoryControllers.delete);
	router.get("/categories", categoryControllers.getAll);
	router.get("/getAllFields", categoryControllers.getFormattedFields);
	router.get("/categories/array", categoryControllers.getCategoryArray);
	router.put("/category/:id", auth.adminAccess(), categoryControllers.update);

	// Subcategory routes
	router.post("/category/subcategory/:id", auth.adminAccess(), categoryControllers.addSubCategory);
	router.delete("/category/:id/subcategory/:subCategoryId", auth.adminAccess(), categoryControllers.deleteSubCategory);
	router.put("/category/:id/subcategory/:subCategoryId", auth.adminAccess(), categoryControllers.updateSubCategory);

	//options routes
	router.post("/category/:id/subcategory/:subCategoryId/field", auth.adminAccess(), categoryControllers.addFieldToSubCategory);
	router.put(
		"/category/:id/subcategory/:subCategoryId/field/:fieldId",
		auth.adminAccess(),
		categoryControllers.updateFieldInSubCategory
	);
	router.delete(
		"/category/:id/subcategory/:subCategoryId/field/:fieldId",
		auth.adminAccess(),
		categoryControllers.deleteFieldFromSubCategory
	);
};
