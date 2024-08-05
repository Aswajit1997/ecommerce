const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		otp: { type: Number },
		password: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

adminSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

adminSchema.methods.generateJWT = function () {
	return jwt.sign(
		{
			id: this._id,
			exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
		},
		"(m2H:)1=G:4`?|w"
	);
};

adminSchema.methods.toAuthJSON = function () {
	return {
		_id: this._id,
		token: this.generateJWT(),
	};
};

adminSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
