const nodemailer = require("nodemailer");
const { SenderEmailPassword, SenderEmail } = require("../config/config");

const sendMail = (email, subject, content) => {
	console.log(email, SenderEmail, SenderEmailPassword);

	try {
		return new Promise((resolve, reject) => {
			const transporter = nodemailer.createTransport({
				port: 587,
				host: "smtp.gmail.com",
				auth: {
					user: "dummyecommerse@gmail.com",
					pass: "djao vxax yrap ieqs",
				},
			});

			const mailDataUser = {
				from: "dummyecommerse@gmail.com",
				to: email,
				subject: subject,
				html: `<h3>Otp to login E-commerce</h3><h4>Valid for one time</h4><p>${content}</p>`,
			};

			transporter.sendMail(mailDataUser, (error, info) => {
				if (error) {
					console.error("Error sending email:", error);
					transporter.close();
					reject(error);
				} else {
					console.log("Email sent to User:", info.envelope);
					transporter.close();
					resolve(true);
				}
			});
		});
	} catch (error) {
		console.log(error);
		return false;
	}
};

module.exports = sendMail;
