import express from "express";
import { getRevenueReports } from "../controllers/revenueController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/reports", verifyToken, getRevenueReports);

export default router;
