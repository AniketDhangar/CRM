// controllers/pdfController.js
import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import User from "../models/UserSchema.js";
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";

export const getInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "invoice" } = req.query;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await Order.findOne({ _id: id, userId })
      .populate("services.service")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    const studio = await User.findById(userId).lean();
    const pdfBuffer = await generateInvoicePDF(order, studio, type);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `inline; filename=${type}-${order.invoiceNumber || id}.pdf`,
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF Error:", error);
    res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  }
};
