
import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import { getInvoicePDF } from "../controllers/getInvoicePDFController.js";

const pdfRouter = express.Router();

pdfRouter.get("/order/:id/pdf", verifyToken, getInvoicePDF); // ?type=invoice | bill | quotation

export default pdfRouter;
