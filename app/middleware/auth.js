const jwt = require("jsonwebtoken");
const _ = require("lodash");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");

exports.grantAccess = function (modName, permName) {
	return async (req, res, next) => {
		try {
			const token = req.header("authorization");
			if (!token) return res.status(401).send({ status: 401, message: "Access Denied: No Token Provided!" });
			try {
				const decoded = jwt.verify(token, "(m2H:)1=G:4`?|w");
				if (decoded) {
					const userData = await User.findOne({ _id: decoded.id });

					if (userData) {
						req.authID = decoded.id;
						next();
					} else {
						res.status(401).send({
							status: 401,
							data: {
								message: "Wrong User Credential , Incorrect Token",
								details: "Try Login again...",
							},
							error: "",
						});
					}
				} else {
					res.status(401).send({
						status: 401,
						data: { message: "Unable to process your request", details: "" },
						error: "",
					});
				}
			} catch (err) {
				res.status(401).send({
					status: 401,
					data: { message: "Invalid Token", details: "" },
					error: err?.message,
				});
			}
		} catch (error) {
			next(error);
		}
	};
};

exports.adminAccess = function () {
	return async (req, res, next) => {
		try {
			const token = req.header("authorization");
			if (!token) return res.status(401).send({ status: 401, message: "Access Denied: No Token Provided!" });
			try {
				const decoded = jwt.verify(token, "(m2H:)1=G:4`?|w");
				if (decoded) {
					const adminData = await Admin.findOne({ _id: decoded.id });

					if (adminData) {
						req.authID = decoded.id;
						next();
					} else {
						res.status(401).send({
							status: 401,
							data: {
								message: "Wrong Admin Credential , Incorrect Token",
								details: "Try Login again...",
							},
							error: "Token Mismatch",
						});
					}
				} else {
					res.status(401).send({
						status: 401,
						data: { message: "Invalid token", details: "Incorrect token try logging in again..." },
						error: "",
					});
				}
			} catch (ex) {
				res.status(401).send({
					status: 401,
					data: { message: "Invalid Token", details: "" },
					error: ex?.message,
				});
			}
		} catch (error) {
			next(error);
		}
	};
};

module.exports = exports;
