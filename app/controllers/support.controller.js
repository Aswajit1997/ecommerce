const Support = require("../models/support.model");
const { imageUpload } = require("../config/firebase");

const supportControllers = {};



// Create support ticket
supportControllers.create = async (req, res) => {
	try {
		const { name, email, phone, reason, message } = req.body;
		const files = req.files;

		if (!name) return res.status(400).send({ status: false, msg: "Please provide your name." });
		if (!email) return res.status(400).send({ status: false, msg: "Please provide your email." });
		if (!reason) return res.status(400).send({ status: false, msg: "Please provide the reason." });
		if (!message) return res.status(400).send({ status: false, msg: "Please provide the message." });
		if (!files || files.length === 0)
			return res.status(400).send({ status: false, msg: "Please provide at least one screenshot." });

		let screenshots = [];
		for (const file of files) {
			const folderName = "support_screenshots";
			const filename = `${name}-${Date.now()}`;
			const imgUrl = await imageUpload(file, filename, folderName);
			if (imgUrl) screenshots.push(imgUrl);
		}

		const newSupport = await Support.create({
			name,
			email,
			phone,
			reason,
			message,
			screenshots,
		});

		return res.status(200).send({ status: true, msg: "Support ticket created successfully.", data: newSupport });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

//get all with pagination
supportControllers.getAll = async (req, res) => {
	try {
		const page = parseInt(req.query.page) >= 1 ? parseInt(req.query.page) : 1;
		const limit = parseInt(req.query.limit) >= 1 ? parseInt(req.query.limit) : 25;

		const options = {
			limit: limit,
			skip: (page - 1) * limit,
			sort: { createdAt: -1 },
		};

		const filter = {};
		const { status } = req.query;

		if (status) {
			if (["resolved", "unresolved"].includes(status)) {
				filter.status = status;
			} else {
				return res.status(400).send({ status: false, msg: "Invalid status value. Must be 'resolved' or 'unresolved'." });
			}
		}

		const data = await Support.find(filter, null, options);
		const totalDataCount = await Support.countDocuments(filter);

		return res.status(200).json({
			status: true,
			msg: "Support tickets fetched successfully.",
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

// Update support ticket status
supportControllers.updateStatus = async (req, res) => {
	try {
		const { supportId } = req.params;
		const { status } = req.body;

		if (!["resolved", "unresolved"].includes(status))
			return res.status(400).send({ status: false, msg: "Invalid status value." });

		const support = await Support.findByIdAndUpdate(supportId, { status }, { new: true });

		if (!support) return res.status(404).send({ status: false, msg: "Support ticket not found." });

		return res.status(200).send({ status: true, msg: "Support ticket status updated successfully.", data: support });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = supportControllers;
