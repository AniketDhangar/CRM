import express from "express";
import { getRevenueReports, getDashboardStats } from "../controllers/revenueController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/reports", verifyToken, getRevenueReports);
router.get('/dashboard-stats', verifyToken, getDashboardStats);

export default router;
