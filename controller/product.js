import Product from "../models/product.js";
import { v2 as cloudinary } from "cloudinary";

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      category,
      description,
      faces,
      country,
      weight,
      size,
      stock,
      subCategory,
    } = req.body;
    const isSale = req.body.isSale == "true";
    const isTopSelling = req.body.isSale == "true";
    const isSpecial = req.body.isSpecial == "true";
    const isExclusive = req.body.isExclusive == "true";

    // Check if files were uploaded
    if (!req.files || !req.files.img) {
      return res.status(404).json({ message: "No files uploaded" });
    }

    // Handle single or multiple images
    const files = Array.isArray(req.files.img)
      ? req.files.img
      : [req.files.img];

    // Upload all images to Cloudinary
    const uploadResults = await Promise.all(
      files.map((file) => cloudinary.uploader.upload(file.tempFilePath))
    );

    // Get the secure URLs of uploaded images
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // Create a new product
    const product = new Product({
      title,
      price,
      category,
      img: imageUrls, // Store all image URLs in an array
      description,
      isSale,
      faces,
      isSpecial,
      country,
      isTopSelling,
      weight,
      size,
      stock,
      subCategory,
      isExclusive,
    });

    // Save the product to the database
    const savedProduct = await product.save();

    res.status(201).json({ savedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Product.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ error: "Product not found!!" });
    } else {
      res.status(200).json({ msg: "Product Deleted" });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse request body and handle removed images
    const {
      name,
      price,
      category,
      description,
      isSale,
      faces,
      isSpecial,
      country,
      stock,
      isExclusive,
      subCategory,
      removedImages = "[]", // Default to empty array string
    } = req.body;

    // Safely parse removed images
    const parsedRemovedImages = JSON.parse(removedImages);

    // Validate product existence first
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Handle image removal from Cloudinary
    if (parsedRemovedImages?.length > 0) {
      try {
        await Promise.all(
          parsedRemovedImages.map(async (url) => {
            // Improved public ID extraction
            const publicId = url.match(/\/([^/]+)\.[a-z]+$/)?.[1];
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          })
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        return res.status(500).json({
          error: "Failed to delete old images",
          details: cloudinaryError.message,
        });
      }
    }

    // Handle new image uploads
    let newImageUrls = [];
    if (req.files?.imgFile) {
      try {
        const files = Array.isArray(req.files.imgFile)
          ? req.files.imgFile
          : [req.files.imgFile];

        newImageUrls = await Promise.all(
          files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.tempFilePath);
            return result.secure_url;
          })
        );
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          error: "Failed to upload new images",
          details: uploadError.message,
        });
      }
    }

    // Combine and validate images
    const updatedImg = [
      ...existingProduct.img.filter(
        (url) => !parsedRemovedImages.includes(url)
      ),
      ...newImageUrls,
    ];

    if (updatedImg.length > 4) {
      return res.status(400).json({ error: "Maximum 4 images allowed" });
    }

    // Update product with converted boolean values
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price: price,
        category,
        img: updatedImg,
        description,
        isSale: isSale === "True",
        faces,
        isSpecial: isSpecial === "True",
        country,
        isExclusive: isExclusive === "True",
        subCategory,
        stock: stock,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { title = " ", page = 1, limit = 8 } = req.query;
    const parsedTitle = isNaN(title) ? title : title.toString();
    const products = await Product.find({
      $or: [
        { title: { $regex: parsedTitle, $options: "i" } },
        { description: { $regex: parsedTitle, $options: "i" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
