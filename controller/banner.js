import Banner from "../models/banner.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";


// Helper function to validate YouTube URL
const isValidYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Helper function to extract YouTube video ID
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Add multiple images/videos/YouTube links to a banner by name
export const addImages = async (req, res) => {
  try {
    const { name, youtubeLinks } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Banner name is required" });
    }

    // Check if files or YouTube links are provided
    const hasFiles = req.files && req.files.thumbnails;
    const hasYouTubeLinks = youtubeLinks && (Array.isArray(youtubeLinks) ? youtubeLinks.length > 0 : youtubeLinks.trim() !== '');

    if (!hasFiles && !hasYouTubeLinks) {
      return res.status(400).json({ message: "Please provide image/video files or YouTube links" });
    }

    const files = hasFiles 
      ? (Array.isArray(req.files.thumbnails) ? req.files.thumbnails : [req.files.thumbnails])
      : [];

    const youtubeLinksArray = hasYouTubeLinks
      ? (Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks]).filter(link => link && link.trim() !== '')
      : [];

    // Find by name
    let banner = await Banner.findOne({ name });

    // Create new banner if not exists
    if (!banner) {
      banner = new Banner({ name });
    }

    // Check total media limit (files + YouTube links)
    const totalNewMedia = files.length + youtubeLinksArray.length;
    if (banner.images.length + totalNewMedia > 3) {
      return res.status(400).json({
        message: `Cannot add more than 3 media items. You can add ${3 - banner.images.length} more.`
      });
    }

    // Validate YouTube links
    for (const link of youtubeLinksArray) {
      if (!isValidYouTubeUrl(link)) {
        return res.status(400).json({ message: `Invalid YouTube URL: ${link}` });
      }
    }

    // Upload files to Cloudinary
    const uploadedUrls = [];
    for (const file of files) {
      try {
        if (!file.tempFilePath) {
          console.error("File tempFilePath is missing:", file);
          throw new Error("File path is missing");
        }
        const url = await uploadToCloudinary(file.tempFilePath);
        if (!url || typeof url !== 'string') {
          console.error("Cloudinary upload returned invalid result:", url);
          throw new Error("Invalid upload result - expected URL string");
        }
        uploadedUrls.push(url);
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
    }

    // Add YouTube links (store as-is, we'll handle embedding on frontend)
    uploadedUrls.push(...youtubeLinksArray);

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

    // Delete from Cloudinary only if it's not a YouTube URL
    if (!isValidYouTubeUrl(imageUrl)) {
      await deleteFromCloudinary(imageUrl);
    }

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
      // Return empty array instead of 404 for better frontend handling
      return res.status(200).json([]);
    }

    res.status(200).json(banner.images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update/replace all images/videos/YouTube links in a banner
export const updateBanner = async (req, res) => {
  try {
    const { name, youtubeLinks } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Banner name is required" });
    }

    // Check if files or YouTube links are provided
    const hasFiles = req.files && req.files.thumbnails;
    const hasYouTubeLinks = youtubeLinks && (Array.isArray(youtubeLinks) ? youtubeLinks.length > 0 : youtubeLinks.trim() !== '');

    if (!hasFiles && !hasYouTubeLinks) {
      return res.status(400).json({ message: "Please provide image/video files or YouTube links" });
    }

    const files = hasFiles 
      ? (Array.isArray(req.files.thumbnails) ? req.files.thumbnails : [req.files.thumbnails])
      : [];

    const youtubeLinksArray = hasYouTubeLinks
      ? (Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks]).filter(link => link && link.trim() !== '')
      : [];

    // Find or create banner
    let banner = await Banner.findOne({ name });
    if (!banner) {
      banner = new Banner({ name });
    }

    // Validate YouTube links
    for (const link of youtubeLinksArray) {
      if (!isValidYouTubeUrl(link)) {
        return res.status(400).json({ message: `Invalid YouTube URL: ${link}` });
      }
    }

    // Delete old images from Cloudinary (only if they're not YouTube links)
    if (banner.images && banner.images.length > 0) {
      for (const oldImageUrl of banner.images) {
        // Only delete from Cloudinary if it's not a YouTube URL
        if (!isValidYouTubeUrl(oldImageUrl)) {
          try {
            await deleteFromCloudinary(oldImageUrl);
          } catch (err) {
            console.error("Error deleting old image from Cloudinary:", err);
          }
        }
      }
    }

    // Upload new files to Cloudinary
    const uploadedUrls = [];
    for (const file of files) {
      try {
        if (!file.tempFilePath) {
          console.error("File tempFilePath is missing:", file);
          throw new Error("File path is missing");
        }
        const url = await uploadToCloudinary(file.tempFilePath);
        if (!url || typeof url !== 'string') {
          console.error("Cloudinary upload returned invalid result:", url);
          throw new Error("Invalid upload result - expected URL string");
        }
        uploadedUrls.push(url);
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
    }

    // Add YouTube links
    uploadedUrls.push(...youtubeLinksArray);

    // Replace all media
    banner.images = uploadedUrls;
    await banner.save();

    res.status(200).json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
