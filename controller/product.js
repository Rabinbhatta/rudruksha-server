import mongoose from "mongoose";
import Product from "../models/product.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

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
      stock,
      defaultVariant,
      subCategory,
      keywords, // comma-separated string
      size // expected JSON string or array
    } = req.body;

    let { discount } = req.body;
    let { variants } = req.body;

    const isSale = req.body.isSale === "true";
    const isTopSelling = req.body.isTopSelling === "true";
    const isSpecial = req.body.isSpecial === "true";
    const isExclusive = req.body.isExclusive === "true";

    // ✅ Convert keywords to array
    const keywordsArray = keywords
      ? keywords.split(",").map((k) => k.trim())
      : [];

    // ✅ Convert size field into array of objects [{name, price}]
    let parsedSizes = [];
    if (size) {
      try {
        if (typeof size === "string") {
          parsedSizes = JSON.parse(size); 
        } else {
          parsedSizes = size;
        }
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid size format. Expecting JSON." });
      }
    }

    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
      return res
        .status(400)
        .json({ message: "Size must be a non-empty array." });
    }

    // ✅ File check
    if (!req.files || !req.files.img) {
      return res.status(404).json({ message: "No files uploaded" });
    }

    const files = Array.isArray(req.files.img) ? req.files.img : [req.files.img];

    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.tempFilePath))
    );

    const imageUrls = uploadResults.map((result) => result);

    if (discount && typeof discount === 'string') {
  discount = JSON.parse(discount)
}
      if (variants && typeof variants === 'string') {
  variants = JSON.parse(variants)

}


    // ✅ Create product with new `size` format
    const product = new Product({
      title,
      price,
      category,
      img: imageUrls,
      description,
      isSale,
      faces,
      isSpecial,
      country,
      isTopSelling,
      weight,
      size: parsedSizes, // << here
      stock,
      subCategory,
      isExclusive,
      keywords: keywordsArray,
      variants,
      defaultVariant,
      discount
    });

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
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found!!" });
    }
    // Delete images from Cloudinary
    await Promise.all(
      product.img.map(async (url) => {
        await deleteFromCloudinary(url);
      })
    );
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

    // ✅ Parse all incoming fields like in createProduct
    let {
      title,
      price,
      category,
      description,
      faces,
      country,
      weight,
      stock,
      defaultVariant,
      subCategory,
      keywords,
      size,
      discount,
      variants,
      removedImages = "[]"
    } = req.body;

    const isSale = req.body.isSale === "true" || req.body.isSale === "True";
    const isTopSelling = req.body.isTopSelling === "true" || req.body.isTopSelling === "True";
    const isSpecial = req.body.isSpecial === "true" || req.body.isSpecial === "True";
    const isExclusive = req.body.isExclusive === "true" || req.body.isExclusive === "True";

    // ✅ Convert keywords (comma-separated) to array
    const keywordsArray = keywords
      ? keywords.split(",").map((k) => k.trim())
      : [];

    // ✅ Parse size field
    let parsedSizes = [];
    if (size) {
      try {
        parsedSizes = typeof size === "string" ? JSON.parse(size) : size;
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid size format. Expecting JSON." });
      }
    }

    // ✅ Parse discount & variants if sent as string
    if (discount && typeof discount === "string") {
      discount = JSON.parse(discount);
    }
    if (variants && typeof variants === "string") {
      variants = JSON.parse(variants);
    }

    // ✅ Parse removed images
    const parsedRemovedImages = JSON.parse(removedImages);

    // ✅ Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ Remove old images if provided
    if (parsedRemovedImages?.length > 0) {
      try {
        await Promise.all(
          parsedRemovedImages.map(async (url) => {
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

    // ✅ Upload new images if provided
    let newImageUrls = [];
    if (req.files?.img) {
      try {
        const files = Array.isArray(req.files.img)
          ? req.files.img
          : [req.files.img];

        newImageUrls = await Promise.all(
          files.map((file) => uploadToCloudinary(file.tempFilePath))
        );
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          error: "Failed to upload new images",
          details: uploadError.message,
        });
      }
    }

    // ✅ Merge old + new images
    const updatedImg = [
      ...existingProduct.img.filter(
        (url) => !parsedRemovedImages.includes(url)
      ),
      ...newImageUrls,
    ];

    if (updatedImg.length > 4) {
      return res.status(400).json({ error: "Maximum 4 images allowed" });
    }

    // ✅ Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        price,
        category,
        img: updatedImg,
        description,
        isSale,
        faces,
        isSpecial,
        country,
        isTopSelling,
        weight,
        size: parsedSizes,
        stock,
        subCategory,
        isExclusive,
        keywords: keywordsArray,
        variants,
        defaultVariant,
        discount
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
    const { title = "", page = 1, limit = 8 } = req.query;
    const searchTerm = title.trim();

    const regex = new RegExp(searchTerm, "i");

    // Proper query for string arrays
    const query = {
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
        { subCategory: regex },
        { keywords: { $regex: regex } }, // ✅ works for array of strings
      ],
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Run in parallel for speed
    const [products, totalCount] = await Promise.all([
      Product.find(query).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      products,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching products", error: error.message });
  }
};

export const toggleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body;
    const validFields = ["isSale", "isTopSelling", "isSpecial", "isExclusive"];

    if (!validFields.includes(field)) {
      return res.status(400).json({ message: "Invalid field to toggle" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product[field] = !product[field];
    await product.save();
    res.status(200).json({ message: `Product ${field} toggled`, product });
  } catch (error) {
    res.status(500).json({ message: "Error toggling product field", error: error.message });
  }
};



