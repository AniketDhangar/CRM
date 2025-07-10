import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  addOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  bulkUpdateOrderStatus,
} from "../controllers/orderController.js";

const orderRouter = express.Router();
orderRouter.post("/addorder", verifyToken, addOrder);
orderRouter.post("/orderbyid", verifyToken, getOrderById);
orderRouter.get("/allorders", verifyToken, getAllOrders);
orderRouter.patch("/updateorder", verifyToken, updateOrder);
orderRouter.delete("/deleteorder", verifyToken, deleteOrder);
orderRouter.post("/bulk-update-status", verifyToken, bulkUpdateOrderStatus);


export default orderRouter;
