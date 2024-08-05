const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Payment = require("../models/payment.model");
const { imageUpload, deleteFromFirebase } = require("../config/firebase");

const productControllers = {};

productControllers.create = async (req, res) => {
	try {
		const { name, price, discount, category, description, brand, color, offers, pattern, size, occasion, fabric } = req.body;
		const files = req.files;

		if (!name) return res.status(400).send({ status: false, msg: "Please provide the product name." });
		if (!price) return res.status(400).send({ status: false, msg: "Please provide the product price." });
		if (!category) return res.status(400).send({ status: false, msg: "Please provide the product category." });
		if (!description) return res.status(400).send({ status: false, msg: "Please provide the product description." });
		if (!files || files.length === 0)
			return res.status(400).send({ status: false, msg: "Please provide at least one product image." });

		const categoryDoc = await Category.findOne({ name: category });
		if (!categoryDoc) return res.status(404).send({ status: false, msg: "Category not found." });

		let productImages = [];
		for (const file of files) {
			const folderName = categoryDoc.name;
			const filename = `${name}-${categoryDoc.name}-${Date.now()}`;
			const imgUrl = await imageUpload(file, filename, folderName);
			if (imgUrl) productImages.push(imgUrl);
		}

		const newProduct = await Product.create({
			name,
			price,
			description,
			discount,
			brand,
			color: JSON.parse(color),
			offers,
			pattern,
			size,
			occasion,
			fabric,
			productImages,
			category: categoryDoc._id,
			createdBy: req.authID,
		});

		return res.status(200).send({ status: true, msg: "Product created successfully.", data: newProduct });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

productControllers.delete = async (req, res) => {
	try {
		const { id } = req.params;

		const product = await Product.findById(id);
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

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
		const { category, brand, color, priceRange } = req.query;

		if (category) {
			const categoryDoc = await Category.findOne({ name: category });
			if (categoryDoc) filter.category = categoryDoc._id;
		}
		if (brand) filter.brand = brand;
		if (color) filter.color = { $in: color.split(",") };
		if (priceRange) {
			const [min, max] = priceRange.split("-").map(Number);
			filter.price = { $gte: min, $lte: max };
		}

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

productControllers.getByCategory = async (req, res) => {
	try {
		const { category } = req.query;

		const categoryDoc = await Category.findOne({ name: category });
		if (!categoryDoc) return res.status(404).send({ status: false, msg: "Category not found." });

		const products = await Product.find({ category: categoryDoc._id });

		return res.status(200).send({ status: true, msg: "Products fetched successfully.", data: products });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

productControllers.edit = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, price, discount, category, description, brand, color, offers, pattern, size, occasion, fabric } = req.body;
		const files = req.files;

		const product = await Product.findById(id);
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

		let categoryDoc;
		if (category) {
			categoryDoc = await Category.findOne({ name: category });
			if (!categoryDoc) return res.status(404).send({ status: false, msg: "Category not found." });
			product.category = categoryDoc._id;
		}

		if (files && files.length > 0) {
			for (const imgUrl of product.productImages) {
				await deleteFromFirebase(imgUrl);
			}

			let productImages = [];
			for (const file of files) {
				const folderName = categoryDoc ? categoryDoc.name : product.category.name;
				const filename = `${name}-${folderName}-${Date.now()}`;
				const imgUrl = await imageUpload(file, filename, folderName);
				if (imgUrl) productImages.push(imgUrl);
			}
			product.productImages = productImages;
		}

		product.name = name || product.name;
		product.price = price || product.price;
		product.discount = discount || product.discount;
		product.description = description || product.description;
		product.brand = brand || product.brand;
		product.color = color ? JSON.parse(color) : product.color;
		product.offers = offers || product.offers;
		product.pattern = pattern || product.pattern;
		product.size = size || product.size;
		product.occasion = occasion || product.occasion;
		product.fabric = fabric || product.fabric;

		if (price || discount) {
			product.discountedPrice = product.price - (product.price * product.discount) / 100;
		}

		await product.save();

		return res.status(200).send({ status: true, msg: "Product updated successfully.", data: product });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = productControllers;
