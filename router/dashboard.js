import express from "express";
import { dashboardStats } from "../controller/dashboard.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", verifyAdmin, dashboardStats);

export default router;