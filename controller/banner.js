import Banner from "../models/banner.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";


// Add multiple images to a banner by name
export const addImages = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Banner name is required" });
    }

    if (!req.files || !req.files.thumbnails) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const files = Array.isArray(req.files.thumbnails)
      ? req.files.thumbnails
      : [req.files.thumbnails];

    // Find by name
    let banner = await Banner.findOne({ name });

    // Create new banner if not exists
    if (!banner) {
      banner = new Banner({ name });
    }

    // Check image limit
    if (banner.images.length + files.length > 3) {
      return res.status(400).json({
        message: `Cannot add more than 3 images. You can add ${3 - banner.images.length} more.`
      });
    }

    // Upload files to Cloudinary
    const uploadedUrls = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.tempFilePath);
      uploadedUrls.push(result.secure_url);
    }

    // Save URLs to DB
    banner.images.push(...uploadedUrls);
    await banner.save();

    res.status(200).json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Remove image by name
export const removeImage = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;

    if (!name || !imageUrl) {
      return res.status(400).json({ message: "Name and imageUrl are required" });
    }

    const banner = await Banner.findOne({ name });

    if (!banner || !banner.images.includes(imageUrl)) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(imageUrl);

    // Remove from DB
    banner.images = banner.images.filter(img => img !== imageUrl);
    await banner.save();

    res.status(200).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all images (first banner found)
export const getImages = async (req, res) => {
  try {
    const banner = await Banner.findOne();
    if (!banner) return res.status(404).json({ message: "No images found" });

    res.status(200).json(banner.images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ⭐ Get images by banner name
export const getImagesByName = async (req, res) => {
  try {
    const { name } = req.params;

    const banner = await Banner.findOne({ name });
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json(banner.images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
