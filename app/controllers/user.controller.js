const userController = {};
const User = require("../models/user.model");
const sendEmail = require("../utils/sendMail");
const { imageUpload, deleteFromFirebase } = require("../config/firebase");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Register a user
userController.create = async function (req, res) {
	const reqBody = req.body;

	try {
		const userExist = await User.findOne({
			email: reqBody.email,
		});

		if (userExist) {
			let resp = {
				status: 0,
				message: "email already registered",
				error: "email must be unique",
			};
			return res.status(400).send(resp);
		}

		const userRecord = new User(reqBody);

		if (reqBody.password) {
			userRecord.password = userRecord.generateHash(reqBody.password);
		}

		const saveRecord = await userRecord.save();
		const userInfo = userRecord.toJSON();
		const userRequiredInfo = {
			_id: userInfo._id,
			name: userInfo.name,
			email: userInfo.email,
		};

		const token = saveRecord.toAuthJSON();

		res.status(200).send({
			status: 1,
			data: {
				userInfo: userRequiredInfo,
				token: token.token,
			},
			message: "User Created Successfully",
		});
	} catch (err) {
		console.error("Error during user creation:", err);
		res.status(400).send({
			status: 0,
			data: err,
			message: "User Creation Error",
		});
	}
};

// Login a user
userController.login = async function (req, res) {
	const reqBody = req.body;

	try {
		// Find user by email
		const userRecord = await User.findOne({ email: reqBody.email });

		if (!userRecord) {
			return res.status(400).send({
				status: 0,
				message: "Please enter a registered email",
				error: "Invalid  email",
			});
		}

		if (!userRecord.validPassword(reqBody.password)) {
			return res.status(400).send({
				status: 0,
				message: "Please enter the correct password",
				error: "Invalid password",
			});
		}

		const otp = generateOTP().toString();
		userRecord.otp = otp;
		await userRecord.save();

		const userInfo = userRecord.toJSON();
		const token = userRecord.generateJWT();
		userInfo.token = token;
		userInfo.otp = otp;

		// if (reqBody.email) {
		// 	const sendOtpToEmail = async () => {
		// 		try {
		// 			await sendEmail(reqBody.email, "Login Otp For E-Commerce", otp);
		// 		} catch (error) {
		// 			console.error("Failed to send email:", error);
		// 		}
		// 	};

		// 	sendOtpToEmail();
		// }

		return res.status(200).send({
			status: 1,
			message: "OTP sent to your Email Id for login.",
			otp,
		});
	} catch (err) {
		return res.status(400).send({
			status: 0,
			message: "Error logging in",
			error: err.message,
		});
	}
};

// Verify OTP
userController.verifyOtp = async function (req, res) {
	const reqBody = req.body;

	try {
		const userRecord = await User.findOne({ email: reqBody.email });

		if (!userRecord) {
			return res.status(400).send({
				status: 0,
				message: "Please enter a email id ",
				error: "Invalid Email ",
			});
		}

		if (!userRecord.validPassword(reqBody.password)) {
			return res.status(400).send({
				status: 0,
				message: "Please enter the correct password",
				error: "Invalid password",
			});
		}

		if (userRecord.otp != reqBody.otp) {
			return res.status(400).send({
				status: 0,
				message: "Invalid OTP",
				error: "Invalid OTP",
			});
		}

		// OTP verification successful, clear OTP field
		userRecord.otp = null;
		await userRecord.save();

		const userInfo = userRecord.toJSON();

		// const userRequiredInfo = {
		// 	_id: userInfo._id,
		// 	name: userInfo.name,
		// 	email: userInfo.email,
		// };
		const token = userRecord.generateJWT();

		return res.status(200).send({
			status: 1,
			message: "OTP Verified Successfully",
			data: {
				userInfo,
				token,
			},
		});
	} catch (err) {
		return res.status(400).send({
			status: 0,
			message: "Error verifying OTP",
			error: err.message,
		});
	}
};

//update profile
userController.update = async function (req, res) {
	try {
		const userId = req.authID;
		const updateData = req.body;

		const userData = await User.findById(userId);
		const profileUrl = userData?.profilePic;
		await deleteFromFirebase(profileUrl);
		// Check if profilePic is being updated
		if (req.file) {
			const folderName = "profile_pics";
			const filename = `${userId}-${Date.now()}`;
			const imgUrl = await imageUpload(req.file, filename, folderName);

			if (imgUrl) updateData.profilePic = imgUrl;
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

		if (!updatedUser) {
			return res.status(404).send({
				status: 0,
				message: "User not found",
			});
		}

		res.status(200).send({
			status: 1,
			data: updatedUser,
			message: "User updated successfully",
		});
	} catch (error) {
		console.error("Error during user update:", error);
		res.status(400).send({
			status: 0,
			message: "User update error",
			error: error.message,
		});
	}
};

// Get all users with pagination
userController.getAllUsers = async function (req, res) {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const users = await User.find().skip(skip).limit(limit).select("-otp -password  -updatedAt -__v").exec();

		const totalUsers = await User.countDocuments();

		res.status(200).send({
			status: 1,
			data: {
				users,
				totalPages: Math.ceil(totalUsers / limit),
				currentPage: page,
			},
			message: "Users fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(400).send({
			status: 0,
			message: "Error fetching users",
			error: error.message,
		});
	}
};

userController.getUserDetails = async function (req, res) {
	try {
		const userData = await User.findById(req.authID).select("-createdAt -updatedAt -otp -__v");

		res.status(200).send({
			status: 1,
			userData,

			message: "UserData fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching userData:", error);
		res.status(400).send({
			status: 0,
			message: "Error fetching userData",
			error: error.message,
		});
	}
};

module.exports = userController;
