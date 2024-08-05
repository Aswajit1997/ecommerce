const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		savedAddresses: [
			{
				state: { type: String, required: true },
				houseNumber: { type: String },
				city: { type: String, required: true },
				pinCode: { type: Number, required: true },
				address: { type: String, required: true },
				street: { type: String },
				alternativePhoneNumber: { type: Number },
				selected: { type: Boolean, default: false },
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Address", addressSchema);
