const Category = require("../models/category.model");

const categoryControllers = {};

// Create a new category
categoryControllers.create = async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.status(400).send({ status: false, msg: "Please provide a category name." });
		}

		const newCategory = await Category.create({ name });

		return res.status(200).send({ status: true, msg: "Category created successfully.", data: newCategory });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Delete a category
categoryControllers.delete = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).send({ status: false, msg: "Category not found." });
		}

		await Category.deleteOne({ _id: id });

		return res.status(200).send({ status: true, msg: "Category deleted successfully." });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};



// Get categories Array
categoryControllers.getAll = async (req, res) => {
	try {
		const categories = await Category.find({}).select("name");
		return res.status(200).send({ status: true, msg: "Categories fetched successfully.", data: categories });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};


// Get categories Array
categoryControllers.getCategoryArray = async (req, res) => {
	try {
		const categories = await Category.find({}).select("name -_id");
		const categoryNames = categories.map((category) => category.name);
		return res.status(200).send({ status: true, msg: "Categories fetched successfully.", data: categoryNames });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Update a category
categoryControllers.update = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).send({ status: false, msg: "Category not found." });
		}

		if (!name) {
			return res.status(400).send({ status: false, msg: "Please provide a category name." });
		}

		category.name = name;
		await category.save();

		return res.status(200).send({ status: true, msg: "Category updated successfully.", data: category });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = categoryControllers;
