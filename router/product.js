import express from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  searchProduct,
} from "../controller/product.js";

const router = express.Router();

router.post("/create", createProduct);
router.delete("/delete/:id", deleteProduct);
router.patch("/update/:id", editProduct);
router.get("/search", searchProduct);

export default router;
