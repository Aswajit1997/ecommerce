const userController = {};
const User = require("../models/user.model");
const sendEmail = require("../utils/sendMail");

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

		const token = saveRecord.toAuthJSON();

		res.status(200).send({
			status: 1,
			data: {
				...saveRecord.toJSON(),
				token: token,
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

		if (reqBody.email) {
			const sendOtpToEmail = async () => {
				try {
					await sendEmail(reqBody.email, "Login Otp For E-Commerce", otp);
				} catch (error) {
					console.error("Failed to send email:", error);
				}
			};

			sendOtpToEmail();
		}

		return res.status(200).send({
			status: 1,
			message: "OTP sent to your Email Id for login.",
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
		const token = userRecord.generateJWT();
		userInfo.token = token;

		return res.status(200).send({
			status: 1,
			message: "OTP Verified Successfully",
			data: userInfo,
		});
	} catch (err) {
		return res.status(400).send({
			status: 0,
			message: "Error verifying OTP",
			error: err.message,
		});
	}
};

module.exports = userController;
