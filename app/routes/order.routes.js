const auth = require("../middleware/auth.js");

module.exports = (router) => {
	const orderController = require("../controllers/order.controller");

	router.post("/order", auth.grantAccess(), orderController.create);
	router.get("/user-orders", auth.grantAccess(), orderController.getAll);
	router.get("/orders", auth.adminAccess(), orderController.getAllOrders);
	router.get("/orders/:productId/history", auth.adminAccess(), orderController.getOrderHistory);
	router.put("/order/updateStatus", auth.adminAccess(), orderController.updateStatus);
};
