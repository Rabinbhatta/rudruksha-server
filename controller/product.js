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
      keywords, // comma-separated string or JSON string
      size, // JSON string or array
      weightSizeOptions, // NEW: JSON string or array
    } = req.body;

    let { discount, variants } = req.body;

    const isSale = req.body.isSale === "true";
    const isTopSelling = req.body.isTopSelling === "true";
    const isSpecial = req.body.isSpecial === "true";
    const isExclusive = req.body.isExclusive === "true";

    // ✅ Parse keywords into flat array of strings
    let parsedKeywords = [];
    if (keywords) {
      try {
        if (typeof keywords === "string") {
          if (keywords.trim().startsWith("[")) {
            parsedKeywords = JSON.parse(keywords);
          } else {
            parsedKeywords = keywords.split(",").map((k) => k.trim());
          }
        } else if (Array.isArray(keywords)) {
          parsedKeywords = keywords.flatMap((k) =>
            typeof k === "string" ? k.split(",").map((v) => v.trim()) : []
          );
        }
        parsedKeywords = parsedKeywords.map((k) => String(k));
      } catch (err) {
        return res.status(400).json({
          message: "Invalid keywords format. Expecting JSON array or comma-separated string.",
          details: err.message,
        });
      }
    }

    // ✅ Parse size field into array of objects [{name, price}]
    let parsedSizes = [];
    if (size) {
      try {
        parsedSizes = typeof size === "string" ? JSON.parse(size) : size;
      } catch (err) {
        return res.status(400).json({ message: "Invalid size format. Expecting JSON." });
      }
    }

    // ✅ Parse weightSizeOptions field into array of objects [{weight, size}]
    let parsedWeightSizeOptions = [];
    if (weightSizeOptions) {
      try {
        parsedWeightSizeOptions = typeof weightSizeOptions === "string"
          ? JSON.parse(weightSizeOptions)
          : weightSizeOptions;
      } catch (err) {
        return res.status(400).json({
          message: "Invalid weightSizeOptions format. Expecting JSON.",
          details: err.message,
        });
      }
    }

    // ✅ Parse discount and variants if they are strings
    if (discount && typeof discount === "string") {
      discount = JSON.parse(discount);
    }
    if (variants && typeof variants === "string") {
      variants = JSON.parse(variants);
    }

    // ✅ Check uploaded files
    if (!req.files || !req.files.img) {
      return res.status(404).json({ message: "No files uploaded" });
    }
    const files = Array.isArray(req.files.img) ? req.files.img : [req.files.img];
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.tempFilePath))
    );
    const imageUrls = uploadResults.map((result) => result);

    // ✅ Create product
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
      size: parsedSizes,
      weightSizeOptions: parsedWeightSizeOptions, // NEW
      stock,
      subCategory,
      isExclusive,
      keywords: parsedKeywords,
      variants,
      defaultVariant,
      discount,
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
      stock,
      defaultVariant,
      subCategory,
      keywords,
      size,
      weightSizeOptions, // NEW
      discount,
      variants,
      removedImages = "[]"
    } = req.body;

    const isSale = req.body.isSale === "true" || req.body.isSale === "True";
    const isTopSelling = req.body.isTopSelling === "true" || req.body.isTopSelling === "True";
    const isSpecial = req.body.isSpecial === "true" || req.body.isSpecial === "True";
    const isExclusive = req.body.isExclusive === "true" || req.body.isExclusive === "True";

    // ✅ Parse size field
    let parsedSizes = [];
    if (size) {
      try {
        parsedSizes = typeof size === "string" ? JSON.parse(size) : size;
      } catch {
        return res.status(400).json({ message: "Invalid size format. Expecting JSON." });
      }
    }

    // ✅ Parse weightSizeOptions field
    let parsedWeightSizeOptions = [];
    if (weightSizeOptions) {
      try {
        parsedWeightSizeOptions = typeof weightSizeOptions === "string"
          ? JSON.parse(weightSizeOptions)
          : weightSizeOptions;
      } catch {
        return res.status(400).json({ message: "Invalid weightSizeOptions format. Expecting JSON." });
      }
    }

    // ✅ Parse discount & variants if sent as string
    if (discount && typeof discount === "string") {
      discount = JSON.parse(discount);
    }
    if (variants && typeof variants === "string") {
      variants = JSON.parse(variants);
    }

    // ✅ Parse keywords safely (handles multiple formats)
    if (keywords) {
      try {
        if (typeof keywords === "string") {
          keywords = JSON.parse(keywords);
        }
        if (Array.isArray(keywords)) {
          keywords = keywords.flatMap((k) =>
            typeof k === "string" && k.trim().startsWith('["')
              ? JSON.parse(k)
              : k
          );
        }
      } catch (err) {
        return res.status(400).json({
          message: "Invalid keywords format. Expecting JSON array of strings.",
          details: err.message,
        });
      }
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

    // ✅ Update product in DB
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
        size: parsedSizes,
        weightSizeOptions: parsedWeightSizeOptions, // NEW
        stock,
        subCategory,
        isExclusive,
        keywords,
        variants,
        defaultVariant,
        discount,
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



