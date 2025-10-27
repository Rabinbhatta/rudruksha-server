import Upload from "../models/upload.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

const MAX_IMAGES = 20;

// Get all uploads with pagination
export const getUploads = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    const uploads = await Upload.find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Transform uploads to gallery format
    const gallery = uploads.map(upload => {
      const uploadObj = upload.toObject();
      return {
        _id: uploadObj._id,
        gallery: {
          image: uploadObj.media.filter(item => item.type === "image"),
          youtube: uploadObj.media.filter(item => item.type === "youtube")
        },
        createdAt: uploadObj.createdAt,
        updatedAt: uploadObj.updatedAt
      };
    });

    const totalUploads = await Upload.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: gallery,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUploads / limit),
        totalUploads,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching uploads.",
    });
  }
};

// Get single upload by ID
export const getUploadById = async (req, res) => {
  const { id } = req.params;
  try {
    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: "Upload not found",
      });
    }
    res.status(200).json({
      success: true,
      data: upload,
    });
  } catch (error) {
    console.error("Error fetching upload:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching the upload.",
    });
  }
};

// Create new upload
export const createUpload = async (req, res) => {
  try {
    const { youtubeUrls } = req.body; // Array of YouTube URLs
    const media = [];

    // Handle image uploads
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      if (images.length > MAX_IMAGES) {
        return res.status(400).json({
          success: false,
          error: `Maximum ${MAX_IMAGES} images allowed`,
        });
      }

      // Upload images to cloudinary
      const imageUrls = await Promise.all(
        images.map((img) => uploadToCloudinary(img.tempFilePath))
      );

      imageUrls.forEach((url) => {
        media.push({ type: "image", url });
      });
    }

    // Handle YouTube URLs
    if (youtubeUrls) {
      let parsedYoutubeUrls = youtubeUrls;
      if (typeof youtubeUrls === "string") {
        try {
          parsedYoutubeUrls = JSON.parse(youtubeUrls);
        } catch (e) {
          parsedYoutubeUrls = youtubeUrls.split(",").map((url) => url.trim());
        }
      }

      if (Array.isArray(parsedYoutubeUrls)) {
        parsedYoutubeUrls.forEach((url) => {
          if (url && url.trim()) {
            media.push({ type: "youtube", url: url.trim() });
          }
        });
      }
    }

    if (media.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one media item (image or YouTube URL) is required",
      });
    }

    const newUpload = new Upload({ media });
    await newUpload.save();

    res.status(201).json({
      success: true,
      message: "Upload created successfully",
      data: newUpload,
    });
  } catch (error) {
    console.error("Error creating upload:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while creating the upload.",
    });
  }
};

// Add media to existing upload
export const addMediaToUpload = async (req, res) => {
  const { id } = req.params;
  const { youtubeUrls } = req.body;

  try {
    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: "Upload not found",
      });
    }

    const currentImageCount = upload.media.filter(
      (item) => item.type === "image"
    ).length;
    const newMedia = [];

    // Handle new image uploads
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      if (currentImageCount + images.length > MAX_IMAGES) {
        return res.status(400).json({
          success: false,
          error: `Cannot add images. Maximum ${MAX_IMAGES} images allowed. Current count: ${currentImageCount}`,
        });
      }

      const imageUrls = await Promise.all(
        images.map((img) => uploadToCloudinary(img.tempFilePath))
      );

      imageUrls.forEach((url) => {
        newMedia.push({ type: "image", url });
      });
    }

    // Handle new YouTube URLs
    if (youtubeUrls) {
      let parsedYoutubeUrls = youtubeUrls;
      if (typeof youtubeUrls === "string") {
        try {
          parsedYoutubeUrls = JSON.parse(youtubeUrls);
        } catch (e) {
          parsedYoutubeUrls = youtubeUrls.split(",").map((url) => url.trim());
        }
      }

      if (Array.isArray(parsedYoutubeUrls)) {
        parsedYoutubeUrls.forEach((url) => {
          if (url && url.trim()) {
            newMedia.push({ type: "youtube", url: url.trim() });
          }
        });
      }
    }

    if (newMedia.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No media items to add",
      });
    }

    upload.media.push(...newMedia);
    await upload.save();

    res.status(200).json({
      success: true,
      message: "Media added successfully",
      data: upload,
    });
  } catch (error) {
    console.error("Error adding media to upload:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while adding media to the upload.",
    });
  }
};

// Remove specific media item from upload
export const removeMediaFromUpload = async (req, res) => {
  const { id, mediaId } = req.params;

  try {
    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: "Upload not found",
      });
    }

    const mediaItem = upload.media.id(mediaId);
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        error: "Media item not found",
      });
    }

    // Delete image from cloudinary if it's an image
    if (mediaItem.type === "image") {
      await deleteFromCloudinary(mediaItem.url);
    }

    upload.media.pull(mediaId);
    await upload.save();

    res.status(200).json({
      success: true,
      message: "Media item removed successfully",
      data: upload,
    });
  } catch (error) {
    console.error("Error removing media from upload:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while removing media from the upload.",
    });
  }
};

// Update specific media item URL (mainly for YouTube URLs)
export const updateMediaItem = async (req, res) => {
  const { id, mediaId } = req.params;
  const { url } = req.body;

  try {
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: "Upload not found",
      });
    }

    const mediaItem = upload.media.id(mediaId);
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        error: "Media item not found",
      });
    }

    // Only allow updating YouTube URLs
    if (mediaItem.type !== "youtube") {
      return res.status(400).json({
        success: false,
        error: "Only YouTube URLs can be updated. For images, delete and re-upload.",
      });
    }

    mediaItem.url = url;
    await upload.save();

    res.status(200).json({
      success: true,
      message: "Media item updated successfully",
      data: upload,
    });
  } catch (error) {
    console.error("Error updating media item:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while updating the media item.",
    });
  }
};

// Delete entire upload
export const deleteUpload = async (req, res) => {
  const { id } = req.params;

  try {
    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: "Upload not found",
      });
    }

    // Delete all images from cloudinary
    const imageDeletePromises = upload.media
      .filter((item) => item.type === "image")
      .map((item) => deleteFromCloudinary(item.url));

    await Promise.all(imageDeletePromises);

    await Upload.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Upload deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the upload.",
    });
  }
};

// Get media count for an upload
export const getMediaCount = async (req, res) => {
  const { id } = req.params;

  try {
    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: "Upload not found",
      });
    }

    const imageCount = upload.media.filter((item) => item.type === "image").length;
    const youtubeCount = upload.media.filter((item) => item.type === "youtube").length;

    res.status(200).json({
      success: true,
      data: {
        totalMedia: upload.media.length,
        images: imageCount,
        youtube: youtubeCount,
        maxImages: MAX_IMAGES,
        remainingImageSlots: MAX_IMAGES - imageCount,
      },
    });
  } catch (error) {
    console.error("Error getting media count:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while getting media count.",
    });
  }
};