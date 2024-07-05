const Product = require("../models/product.model");
const Category = require("../models/category.model");
const { imageUpload,deleteFromFirebase } = require("../config/firebase");

const productControllers = {};

// Create a new product
productControllers.create = async (req, res) => {
	try {
		const { name, price, discount, category,description } = req.body;
		const files = req.files;

		if (!name || !category || !description || !files || files.length === 0) {
			return res.status(400).send({ status: false, msg: "Please provide all required fields and at least one image." });
		}

		// Find the category by name
		const categoryDoc = await Category.findOne({ name: category });
		if (!categoryDoc) {
			return res.status(404).send({ status: false, msg: "Category not found." });
		}

		let productImages = [];
		for (const file of files) {
			const folderName = categoryDoc.name;
			const filename = `${name}-${categoryDoc.name}-${Date.now()}`;
			const imgUrl = await imageUpload(file, filename, folderName);
			if (imgUrl) {
				productImages.push(imgUrl);
			}
		}

		const newProduct = await Product.create({
			name,
			price,
			description,
			discount,
			productImages,
			category: categoryDoc._id,
		});

		return res.status(200).send({ status: true, msg: "Product created successfully.", data: newProduct });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Delete a product
productControllers.delete = async (req, res) => {
	try {
		const { id } = req.params;

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).send({ status: false, msg: "Product not found." });
		}

		// Delete product images from Firebase
		for (const imgUrl of product.productImages) {
			await deleteFromFirebase(imgUrl);
		}

		await Product.deleteOne({ _id: id });

		return res.status(200).send({ status: true, msg: "Product deleted successfully." });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get all products with pagination
productControllers.getAll = async (req, res) => {
	try {
		const page = parseInt(req.query.page) >= 1 ? parseInt(req.query.page) : 1;
		const limit = parseInt(req.query.limit) >= 1 ? parseInt(req.query.limit) : 25;

		const options = {
			limit: limit,
			skip: (page - 1) * limit,
			sort: { createdAt: -1 },
		};

		const filter = {};

		const data = await Product.find(filter, null, options).populate("category", "name");
		const totalDataCount = await Product.countDocuments(filter);

		return res.status(200).json({
			status: true,
			msg: "Products fetched successfully.",
			totalData: totalDataCount,
			totalPage: Math.ceil(totalDataCount / limit),
			currentPage: page,
			data: data,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Get products by category
productControllers.getByCategory = async (req, res) => {
	try {
		const { category } = req.query;

		const categoryDoc = await Category.findOne({ name: category });
		if (!categoryDoc) {
			return res.status(404).send({ status: false, msg: "Category not found." });
		}
		console.log(categoryDoc);

		const products = await Product.find({ category: categoryDoc._id });

		return res.status(200).send({ status: true, msg: "Products fetched successfully.", data: products });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = productControllers;
