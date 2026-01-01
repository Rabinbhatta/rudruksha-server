import cloudinary from "../config/cloudinary.js";

export const deleteFromCloudinary = async (url) => {
  try {
  const publicId = url.match(/\/v\d+\/([A-Za-z0-9_-]+)\.[A-Za-z]+$/);
  const id = publicId ? publicId[1] : null;
    await cloudinary.v2.uploader.destroy(id);
    console.log(`Image with public ID "${publicId}" deleted from Cloudinary.`);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    throw new Error("Cloudinary deletion failed");
  }
};

export const uploadToCloudinary = async (tempFilePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(tempFilePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};