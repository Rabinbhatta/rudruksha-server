import express from "express";
import {
  getConsultation,
  createConsultation,
  deleteConsultation,
} from "../controller/consultation.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

router.get("/get", verifyAdmin, getConsultation);
router.post("/create", createConsultation);
router.delete("/delete/:id", verifyAdmin, deleteConsultation);

export default router;
