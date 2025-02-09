import express from "express";
import {
  getConsultation,
  createConsultation,
  deleteConsultation,
} from "../controller/consultation.js";

const router = express.Router();

router.get("/get", getConsultation);
router.post("/create", createConsultation);
router.delete("/delete/:id", deleteConsultation);

export default router;
