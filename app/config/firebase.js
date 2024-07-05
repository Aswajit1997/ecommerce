const { initializeApp } = require("firebase/app");
const { getStorage, ref, deleteObject, uploadBytesResumable, getDownloadURL } = require("firebase/storage");

const {
	FIREBASE_apiKey,
	FIREBASE_authDomain,
	FIREBASE_projectId,
	FIREBASE_storageBucket,
	FIREBASE_messagingSenderId,
	FIREBASE_appId,
} = require("../config/config");

const firebaseConfig = {
	apiKey: FIREBASE_apiKey,
	authDomain: FIREBASE_authDomain,
	projectId: FIREBASE_projectId,
	storageBucket: FIREBASE_storageBucket,
	messagingSenderId: FIREBASE_messagingSenderId,
	appId: FIREBASE_appId,
};

initializeApp(firebaseConfig);

const storage = getStorage();

const imageUpload = async (fileData, name, folderName) => {
	const storageRef = ref(storage, `${folderName}/${name}`);
	const metaData = { contentType: fileData.mimetype };

	try {
		const snapShot = await uploadBytesResumable(storageRef, fileData.buffer, metaData);
		const downloadUrl = await getDownloadURL(snapShot.ref);
		console.log(downloadUrl);
		return downloadUrl;
	} catch (error) {
		console.error("Error uploading file:", error);
		throw error;
	}
};

const deleteFromFirebase = async (url) => {
	// console.log("URL to delete:", url);

	try {
		// Extract the path from the URL and decode it
		const path = decodeURIComponent(url.split(`/${firebaseConfig.storageBucket}/o/`)[1].split("?")[0]);
		const desertRef = ref(storage, path);

		await deleteObject(desertRef);
		// console.log("Deleted successfully:", url);
		return true;
	} catch (error) {
		console.error("Error deleting file:", error);
		return false;
	}
};

module.exports = { imageUpload, deleteFromFirebase };
