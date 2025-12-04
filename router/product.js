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

const router = express.Router();

router.post("/create", createProduct);
router.delete("/delete/:id", deleteProduct);
router.patch("/update/:id", editProduct);
router.get("/search", searchProduct);
router.patch("/toggle/:id", toggleProduct);

// Product Review Routes
router.post("/:productID/review/create", jwt_verify, addProductReview);
router.get("/:productID/review/get", getProductReviews);
router.put("/:productID/review/update/:reviewID", jwt_verify, updateProductReview);
router.delete("/:productID/review/delete/:reviewID", jwt_verify, deleteProductReview);

export default router;
