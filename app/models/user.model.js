const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, unique: true },
		phone: { type: String, unique: true },
		address: { type: String },
		pinCode: { type: Number },
		state: { type: String },
		country: { type: String },
		city: { type: String },
		locality: { type: String },
		street: { type: String },
		profilePic: {
			type: String,
			default:
				"https://firebasestorage.googleapis.com/v0/b/file-upload-demo-213de.appspot.com/o/defaultAvatar.jpg?alt=media&token=56f59056-fc87-47cb-9f42-98f8406f892a",
		},
		otp: { type: Number },
		password: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

// userSchema.index({ phoneNo: 1, delete: 1 }, { unique: true });
userSchema.index({ name: 1 });

userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.generateJWT = function () {
	return jwt.sign(
		{
			id: this._id,
			exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
		},
		"(m2H:)1=G:4`?|w"
	);
};

userSchema.methods.toAuthJSON = function () {
	return {
		_id: this._id,
		token: this.generateJWT(),
	};
};

userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
