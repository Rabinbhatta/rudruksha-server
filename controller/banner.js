import Banner from "../models/banner.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

// Add multiple images
export const addImages = async (req, res) => {
  try {
    if (!req.files || !req.files.thumbnails) {
      return res.status(400).json({ message: "No image files provided" });
    }

    // Support both single file and multiple files
    const files = Array.isArray(req.files.thumbnails)
      ? req.files.thumbnails
      : [req.files.thumbnails];

    let gallery = await Banner.findOne();
    if (!gallery) {
      gallery = new Banner();
    }

    if (gallery.banners.length + files.length > 3) {
      return res.status(400).json({ message: `Cannot add more than 3 images. You can add ${3 - gallery.banners.length} more.` });
    }

    // Upload all files to Cloudinary
    const uploadedUrls = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.tempFilePath);
      uploadedUrls.push(result);
    }

    // Save URLs to DB
    gallery.banners.push(...uploadedUrls);
    await gallery.save();

    res.status(200).json(gallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Remove image
export const removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const gallery = await Banner.findOne();

    if (!gallery || !gallery.banners.includes(imageUrl)) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Remove from Cloudinary
    await deleteFromCloudinary(imageUrl);

    // Remove from DB
    gallery.banners = gallery.banners.filter(img => img !== imageUrl);
    await gallery.save();

    res.status(200).json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get images
export const getImages = async (req, res) => {
  try {
    const gallery = await Banner.findOne();
    if (!gallery) return res.status(404).json({ message: "No images found" });
    res.status(200).json(gallery.banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
