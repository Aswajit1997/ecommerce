const Address = require("../models/address.model");

const addressControllers = {};

// Get all saved addresses
addressControllers.getAll = async (req, res) => {
	try {
		const addresses = await Address.findOne({ userId: req.authID });
		if (!addresses) {
			return res.status(200).send({ status: true, data: [] });
		}
		return res.status(200).send({ status: true, data: addresses.savedAddresses });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Add new address
addressControllers.add = async (req, res) => {
	try {
		const { state, houseNumber, city, pinCode, address, street, alternativePhoneNumber } = req.body;

		let userAddresses = await Address.findOne({ userId: req.authID });

		const newAddress = {
			state,
			houseNumber,
			city,
			pinCode,
			address,
			street,
			alternativePhoneNumber,
			selected: !userAddresses || userAddresses.savedAddresses.length === 0,
		};

		if (userAddresses) {
			userAddresses.savedAddresses.push(newAddress);
			await userAddresses.save();
		} else {
			userAddresses = await Address.create({
				userId: req.authID,
				savedAddresses: [newAddress],
			});
		}

		const addedAddress = userAddresses.savedAddresses[userAddresses.savedAddresses.length - 1];

		return res.status(200).send({ status: true, msg: "Address added successfully.", data: addedAddress });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Delete address
addressControllers.delete = async (req, res) => {
	try {
		const { addressId } = req.params;

		const userAddresses = await Address.findOne({ userId: req.authID });

		if (!userAddresses) {
			return res.status(404).send({ status: false, msg: "No addresses found." });
		}

		const addressIndex = userAddresses.savedAddresses.findIndex((addr) => addr._id.toString() === addressId);
		if (addressIndex === -1) {
			return res.status(404).send({ status: false, msg: "Address not found." });
		}

		const deletedAddress = userAddresses.savedAddresses[addressIndex];
		userAddresses.savedAddresses.splice(addressIndex, 1);

		// If the deleted address was selected, select the first address in the array
		if (deletedAddress.selected && userAddresses.savedAddresses.length > 0) {
			userAddresses.savedAddresses[0].selected = true;
		}

		await userAddresses.save();

		return res.status(200).send({ status: true, msg: "Address deleted successfully.", data: deletedAddress });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Set selected address
addressControllers.setSelectedAddress = async (req, res) => {
	try {
		const { addressId } = req.params;

		const userAddresses = await Address.findOne({ userId: req.authID });

		if (!userAddresses) {
			return res.status(404).send({ status: false, msg: "No addresses found." });
		}

		let selectedAddress;
		// Unselect the currently selected address and select the new one
		userAddresses.savedAddresses.forEach((address) => {
			if (address._id.toString() === addressId) {
				address.selected = true;
				selectedAddress = address;
			} else {
				address.selected = false;
			}
		});

		await userAddresses.save();

		return res.status(200).send({ status: true, msg: "Selected address set successfully.", data: selectedAddress });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

// Edit address
addressControllers.edit = async (req, res) => {
	try {
		const { addressId } = req.params;
		const { state, houseNumber, city, pinCode, address, street, alternativePhoneNumber } = req.body;

		const userAddresses = await Address.findOne({ userId: req.authID });

		if (!userAddresses) {
			return res.status(404).send({ status: false, msg: "No addresses found." });
		}

		const addressToEdit = userAddresses.savedAddresses.find((addr) => addr._id.toString() === addressId);
		if (!addressToEdit) {
			return res.status(404).send({ status: false, msg: "Address not found." });
		}

		// Update the address fields
		addressToEdit.state = state;
		addressToEdit.houseNumber = houseNumber;
		addressToEdit.city = city;
		addressToEdit.pinCode = pinCode;
		addressToEdit.address = address;
		addressToEdit.street = street;
		addressToEdit.alternativePhoneNumber = alternativePhoneNumber;

		await userAddresses.save();

		return res.status(200).send({ status: true, msg: "Address edited successfully.", data: addressToEdit });
	} catch (error) {
		console.error(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = addressControllers;
