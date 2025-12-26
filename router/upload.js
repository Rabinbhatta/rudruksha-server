import express from "express";
import * as uploadController from "../controller/upload.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// Main CRUD
router.get("/gallery", uploadController.getUploads);
router.get("/uploads/:id", uploadController.getUploadById);
router.post("/uploads", verifyAdmin, uploadController.createUpload);
router.delete("/uploads/:id", verifyAdmin, uploadController.deleteUpload);

// Media management
router.post("/uploads/:id/media", verifyAdmin, uploadController.addMediaToUpload);
router.delete("/uploads/:id/media/:mediaId", verifyAdmin, uploadController.removeMediaFromUpload);
router.patch("/uploads/:id/media/:mediaId", verifyAdmin, uploadController.updateMediaItem);
router.get("/uploads/:id/count", uploadController.getMediaCount);

export default router;