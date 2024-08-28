const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Coupon = require("../models/coupon.model");
const { imageUpload, deleteFromFirebase } = require("../config/firebase");

const productControllers = {};

// Create a new product
productControllers.create = async (req, res) => {
	try {
		const { name, price, category, subCategory, description, color } = req.body;
		const files = req.files;

		if (!name || !price || !category || !subCategory || !description || !files || files.length === 0) {
			return res.status(400).send({ status: false, msg: "Please provide all required fields and images." });
		}

		const categoryDoc = await Category.findOne({ name: category });
		if (!categoryDoc) return res.status(404).send({ status: false, msg: "Category not found." });

		const subCategoryDoc = categoryDoc.subCategory.find((sub) => sub.name === subCategory);
		if (!subCategoryDoc) return res.status(404).send({ status: false, msg: "Subcategory not found." });

		const productImages = await Promise.all(
			files.map(async (file) => {
				const folderName = categoryDoc.name;
				const filename = `${name}-${categoryDoc.name}-${Date.now()}`;
				return imageUpload(file, filename, folderName);
			})
		);

		const newProduct = await Product.create({
			...req.body,
			color: JSON.parse(color),
			productImages,
			category: categoryDoc._id,
			subCategory: subCategoryDoc.name,
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
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

		await Promise.all(product.productImages.map((imgUrl) => deleteFromFirebase(imgUrl)));

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
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 25;
		const options = {
			limit: limit,
			skip: (page - 1) * limit,
			sort: { createdAt: -1 },
		};

		const filter = {};
		const { category, subCategory, brand, color, priceRange } = req.query;

		if (category) {
			const categoryDoc = await Category.findOne({ name: category });
			if (categoryDoc) filter.category = categoryDoc._id;
		}
		if (subCategory) {
			filter.subCategory = subCategory;
		}
		if (brand) filter.brand = brand;
		if (color) filter.color = { $in: color.split(",") };
		if (priceRange) {
			const [min, max] = priceRange.split("-").map(Number);
			filter.price = { $gte: min, $lte: max };
		}

		const data = await Product.find(filter, null, options)
			.populate("category", "name")
			.populate("subCategory", "name")
			.populate("availableCoupons", "code discount")
			.select("-createdAt -updatedAt -__v");
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
		if (!categoryDoc) return res.status(404).send({ status: false, msg: "Category not found." });

		const products = await Product.find({ category: categoryDoc._id }).populate("subCategory", "name");

		return res.status(200).send({ status: true, msg: "Products fetched successfully.", data: products });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Edit a product
productControllers.edit = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, price, discount, category, subCategory, description, brand, color, offers, pattern, size, occasion, fabric } =
			req.body;
		const files = req.files;

		const product = await Product.findById(id);
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

		if (category) {
			const categoryDoc = await Category.findOne({ name: category });
			if (!categoryDoc) return res.status(404).send({ status: false, msg: "Category not found." });
			product.category = categoryDoc._id;
		}

		if (subCategory) {
			const categoryDoc = await Category.findOne({ "subCategory.name": subCategory });
			if (!categoryDoc) return res.status(404).send({ status: false, msg: "Subcategory not found." });
			product.subCategory = categoryDoc.subCategory.find((sub) => sub.name === subCategory).name;
		}

		if (files && files.length > 0) {
			await Promise.all(product.productImages.map((imgUrl) => deleteFromFirebase(imgUrl)));

			product.productImages = await Promise.all(
				files.map(async (file) => {
					const folderName = product.category ? product.category.name : "default";
					const filename = `${name}-${folderName}-${Date.now()}`;
					return imageUpload(file, filename, folderName);
				})
			);
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

// Add coupon to product
productControllers.addCoupon = async (req, res) => {
	try {
		const { productId, couponIds } = req.body;

		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).send({ status: false, msg: "Invalid product ID." });
		}

		if (!Array.isArray(couponIds) || couponIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
			return res.status(400).send({ status: false, msg: "Invalid coupon IDs." });
		}

		const product = await Product.findById(productId);
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

		const validCoupons = await Coupon.find({ _id: { $in: couponIds } });
		const validCouponIds = validCoupons.map((coupon) => coupon._id.toString());

		if (validCouponIds.length !== couponIds.length) {
			return res.status(400).send({ status: false, msg: "Some coupon IDs are invalid." });
		}

		product.availableCoupons = validCouponIds;
		await product.save();

		return res.status(200).send({ status: true, msg: "Coupons updated successfully.", data: product });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Remove coupon from product
productControllers.removeCoupon = async (req, res) => {
	try {
		const { productId, couponId } = req.body;
		if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(couponId)) {
			return res.status(400).send({ status: false, msg: "Invalid product ID or coupon ID." });
		}

		const product = await Product.findById(productId);
		if (!product) return res.status(404).send({ status: false, msg: "Product not found." });

		const couponIndex = product.availableCoupons.indexOf(couponId);
		if (couponIndex === -1) {
			return res.status(400).send({ status: false, msg: "Coupon not found in product." });
		}

		product.availableCoupons.splice(couponIndex, 1);
		await product.save();

		return res.status(200).send({ status: true, msg: "Coupon removed successfully.", data: product });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = productControllers;
