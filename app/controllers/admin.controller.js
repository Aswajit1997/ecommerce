const adminController = {};
const Admin = require("../models/admin.model");
const sendEmail = require("../utils/sendMail");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Register an admin
adminController.create = async function (req, res) {
	const reqBody = req.body;

	try {
		const adminExist = await Admin.findOne({
			email: reqBody.email,
		});

		if (adminExist) {
			let resp = {
				status: 0,
				message: "email already registered",
				error: "email must be unique",
			};
			return res.status(400).send(resp);
		}

		const adminRecord = new Admin(reqBody);

		if (reqBody.password) {
			adminRecord.password = adminRecord.generateHash(reqBody.password);
		}

		const saveRecord = await adminRecord.save();

		const token = saveRecord.toAuthJSON();

		res.status(200).send({
			status: 1,
			data: {
				...saveRecord.toJSON(),
				token: token,
			},
			message: "Admin Created Successfully",
		});
	} catch (err) {
		console.error("Error during admin creation:", err);
		res.status(400).send({
			status: 0,
			data: err,
			message: "Admin Creation Error",
		});
	}
};

// Login an admin
adminController.login = async function (req, res) {
	const reqBody = req.body;

	try {
		// Find admin by email
		const adminRecord = await Admin.findOne({ email: reqBody.email });

		if (!adminRecord) {
			return res.status(400).send({
				status: 0,
				message: "Please enter a registered email",
				error: "Invalid email",
			});
		}

		if (!adminRecord.validPassword(reqBody.password)) {
			return res.status(400).send({
				status: 0,
				message: "Please enter the correct password",
				error: "Invalid password",
			});
		}

		const otp = generateOTP().toString();
		adminRecord.otp = otp;
		await adminRecord.save();

		const adminInfo = adminRecord.toJSON();
		const token = adminRecord.generateJWT();
		adminInfo.token = token;
		adminInfo.otp = otp;

		// if (reqBody.email) {
		// 	const sendOtpToEmail = async () => {
		// 		try {
		// 			await sendEmail(reqBody.email, "Login OTP For Admin Portal", otp);
		// 		} catch (error) {
		// 			console.error("Failed to send email:", error);
		// 		}
		// 	};

		// 	sendOtpToEmail();
		// }

		return res.status(200).send({
			status: 1,
            message: "OTP sent to your Email Id for login.",
            otp
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
adminController.verifyOtp = async function (req, res) {
	const reqBody = req.body;

	try {
        const adminRecord = await Admin.findOne({ email: reqBody.email });
        console.log(adminRecord,reqBody)

		if (!adminRecord) {
			return res.status(400).send({
				status: 0,
				message: "Please enter a valid email",
				error: "Invalid Email",
			});
		}

		if (!adminRecord.validPassword(reqBody.password)) {
			return res.status(400).send({
				status: 0,
				message: "Please enter the correct password",
				error: "Invalid password",
			});
		}

		if (adminRecord.otp != reqBody.otp) {
			return res.status(400).send({
				status: 0,
				message: "Invalid OTP",
				error: "Invalid OTP",
			});
		}

		// OTP verification successful, clear OTP field
		adminRecord.otp = null;
		await adminRecord.save();

		const adminInfo = adminRecord.toJSON();
		const token = adminRecord.generateJWT();
		adminInfo.token = token;

		return res.status(200).send({
			status: 1,
			message: "OTP Verified Successfully",
			data: adminInfo,
		});
	} catch (err) {
		return res.status(400).send({
			status: 0,
			message: "Error verifying OTP",
			error: err.message,
		});
	}
};

module.exports = adminController;
