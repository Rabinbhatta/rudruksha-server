import express from "express";
import {
  createCategory,
  createSubCategory,
  deleteSubCategory,
  getCategories,
  updateCategory,
} from "../controller/category.js";

const router = express.Router();

router.post("/create", createCategory);
router.post("/create/subCategory/:id", createSubCategory);
router.get("/get", getCategories);
router.patch("/update/:id", updateCategory);
router.patch("/delete/:id", deleteSubCategory);

export default router;
