import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  addOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();
orderRouter.post("/addorder", verifyToken, addOrder);
orderRouter.get("/orderbyid", verifyToken, getOrderById);
orderRouter.get("/allorders", verifyToken, getAllOrders);
orderRouter.patch("/updateorder", verifyToken, updateOrder);
orderRouter.delete("/deleteorder", verifyToken, deleteOrder);



export default orderRouter;
