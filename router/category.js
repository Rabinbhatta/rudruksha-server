import express from "express";
import {
  createCategory,
  createSubCategory,
  createSubCategoryByName,
  deleteSubCategory,
  getCategories,
  getCategoryByName,
  updateCategory,
} from "../controller/category.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

router.post("/create", verifyAdmin, createCategory);
router.post("/create/subCategory/:id", verifyAdmin, createSubCategory);
router.post("/create/subCategory/byName/:categoryName", verifyAdmin, createSubCategoryByName);
router.get("/get", getCategories);
router.get("/get/:categoryName", getCategoryByName);
router.patch("/update/:id", verifyAdmin, updateCategory);
router.patch("/delete/:id", verifyAdmin, deleteSubCategory);

export default router;
