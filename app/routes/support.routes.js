const auth = require("../middleware/auth.js");
const upload = require("../config/multer");
module.exports = (router) => {
	const supportControllers = require("../controllers/support.controller.js");

	router.post("/support", auth.grantAccess(), upload.array("screenshots", 10), supportControllers.create);

	router.put("/support/status/:supportId", auth.adminAccess(), supportControllers.updateStatus);

	router.get("/support", auth.adminAccess(), supportControllers.getAll);
};
