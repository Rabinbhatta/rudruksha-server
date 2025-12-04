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

const router = express.Router();

router.post("/create", createCategory);
router.post("/create/subCategory/:id", createSubCategory);
router.post("/create/subCategory/byName/:categoryName", createSubCategoryByName);
router.get("/get", getCategories);
router.get("/get/:categoryName", getCategoryByName);
router.patch("/update/:id", updateCategory);
router.patch("/delete/:id", deleteSubCategory);

export default router;
