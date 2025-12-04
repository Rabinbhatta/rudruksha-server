import express from "express";
import { 
  addImages, 
  getImages, 
  removeImage,
  getImagesByName 
} from "../controller/banner.js";

const router = express.Router();

// Create or add images to a banner
router.post("/create", addImages);

// Get images from the first banner (default)
router.get("/get", getImages);

// Get images by banner name
router.get("/get/:name", getImagesByName);

// Delete image from a banner
router.delete("/delete", removeImage);

export default router;
