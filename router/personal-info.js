import express from "express";
import {
  getPersonalInfo,
  createOrUpdateFonePayQR,
  createOrUpdateEsewaQR,
  createOrUpdateKhaltiQR,
  addBankQR,
  updateBankQR,
  deleteBankQR,
  updateShippingFees,
} from "../controller/personal-info.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// All routes are public (no authentication required)
router.get("/get", getPersonalInfo);
router.post("/fonepay-qr", verifyAdmin, createOrUpdateFonePayQR);
router.post("/esewa-qr", verifyAdmin, createOrUpdateEsewaQR);
router.post("/khalti-qr", verifyAdmin, createOrUpdateKhaltiQR);
router.post("/bank-qr", verifyAdmin, addBankQR);
router.put("/bank-qr/:id", verifyAdmin, updateBankQR);
router.delete("/bank-qr/:id", verifyAdmin, deleteBankQR);
router.put("/shipping-fees", verifyAdmin, updateShippingFees);

export default router;

