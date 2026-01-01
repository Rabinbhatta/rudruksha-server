import express from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  searchProduct,
  toggleProduct,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  getProductReviews
} from "../controller/product.js";
import { jwt_verify } from "../middleware/verify.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

router.post("/create", verifyAdmin, createProduct);
router.delete("/delete/:id", verifyAdmin, deleteProduct);
router.patch("/update/:id", verifyAdmin, editProduct);
router.get("/search", searchProduct);
router.patch("/toggle/:id", verifyAdmin, toggleProduct);

// Product Review Routes
router.post("/:productID/review/create", jwt_verify, addProductReview);
router.get("/:productID/review/get", getProductReviews);
router.put("/:productID/review/update/:reviewID", jwt_verify, updateProductReview);
router.delete("/:productID/review/delete/:reviewID", jwt_verify, deleteProductReview);

export default router;
