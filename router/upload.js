import express from "express";
import * as uploadController from "../controller/upload.js";

const router = express.Router();

// Main CRUD
router.get("/gallery", uploadController.getUploads);
router.get("/uploads/:id", uploadController.getUploadById);
router.post("/uploads", uploadController.createUpload);
router.delete("/uploads/:id", uploadController.deleteUpload);

// Media management
router.post("/uploads/:id/media", uploadController.addMediaToUpload);
router.delete("/uploads/:id/media/:mediaId", uploadController.removeMediaFromUpload);
router.patch("/uploads/:id/media/:mediaId", uploadController.updateMediaItem);
router.get("/uploads/:id/count", uploadController.getMediaCount);

export default router;