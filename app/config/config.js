require("dotenv").config();
module.exports = {
	MONGO_URL: `mongodb+srv://chiku1997:mongoatlas@cluster0.w74vi8m.mongodb.net/E-commerce-BE?retryWrites=true&w=majority&appName=Cluster0`,
	PORT: process.env.PORT || 3080,

	FIREBASE_apiKey: "AIzaSyBXt7meo7I36S-Im8qONL1gOuPkYH14MKY",
	FIREBASE_authDomain: "hiring-roof.firebaseapp.com",
	FIREBASE_projectId: "hiring-roof",
	FIREBASE_storageBucket: "hiring-roof.appspot.com",
	FIREBASE_messagingSenderId: "841289393844",
	FIREBASE_appId: "1:841289393844:web:edbc8f6e115abc553899e1",
	FIREBASE_measurementId: "G-RCRZE8SD49",

	SenderEmail: process.env.SenderEmail,
	SenderEmailPassword: process.env.SenderEmailPassword,
};
