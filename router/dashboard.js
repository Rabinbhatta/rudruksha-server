import express from "express";
import { dashboardStats } from "../controller/dashboard.js";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", dashboardStats);

export default router;