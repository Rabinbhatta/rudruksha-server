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

const router = express.Router();

// All routes are public (no authentication required)
router.get("/get", getPersonalInfo);
router.post("/fonepay-qr", createOrUpdateFonePayQR);
router.post("/esewa-qr", createOrUpdateEsewaQR);
router.post("/khalti-qr", createOrUpdateKhaltiQR);
router.post("/bank-qr", addBankQR);
router.put("/bank-qr/:id", updateBankQR);
router.delete("/bank-qr/:id", deleteBankQR);
router.put("/shipping-fees", updateShippingFees);

export default router;

