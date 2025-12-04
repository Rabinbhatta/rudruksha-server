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
      stock,
      defaultVariant,
      subCategory,
      keywords, // comma-separated string
      size, // expected JSON string or array [{name: "Small", price: 100, size: "10mm"}]
      benefits, // array of strings
    } = req.body;

    let { discount, variants } = req.body;

    const isSale = req.body.isSale === "true";
    const isTopSelling = req.body.isTopSelling === "true";
    const isSpecial = req.body.isSpecial === "true";
    const isExclusive = req.body.isExclusive === "true";
    const isLabCertified = req.body.isLabCertified === "true" || req.body.isLabCertified === true;
    const isExpertVerified = req.body.isExpertVerified === "true" || req.body.isExpertVerified === true;

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

    // ✅ Parse size field into array of objects [{name: "Small", price: 100, size: "10mm"}]
    let parsedSizes = [];
    if (size) {
      try {
        parsedSizes = typeof size === "string" ? JSON.parse(size) : size;
      } catch (err) {
        return res.status(400).json({ message: "Invalid size format. Expecting JSON." });
      }
    }

    // ✅ Parse benefits into array of strings
    let parsedBenefits = [];
    if (benefits) {
      try {
        if (typeof benefits === "string") {
          parsedBenefits = JSON.parse(benefits);
        } else if (Array.isArray(benefits)) {
          parsedBenefits = benefits;
        }
      } catch (err) {
        // If JSON parse fails, treat as comma-separated string
        parsedBenefits = benefits.split(",").map((b) => b.trim());
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
      img: imageUrls,
      description,
      isSale,
      faces,
      isSpecial,
      country,
      isTopSelling,
      size: parsedSizes,
      stock,
      subCategory,
      isExclusive,
      isLabCertified,
      isExpertVerified,
      keywords: parsedKeywords,
      benefits: parsedBenefits,
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
      size, // expected JSON string or array [{name: "Small", price: 100, size: "10mm"}]
      benefits,
      discount,
      variants,
      removedImages = "[]"
    } = req.body;

    const isSale = req.body.isSale === "true" || req.body.isSale === "True";
    const isTopSelling = req.body.isTopSelling === "true" || req.body.isTopSelling === "True";
    const isSpecial = req.body.isSpecial === "true" || req.body.isSpecial === "True";
    const isExclusive = req.body.isExclusive === "true" || req.body.isExclusive === "True";
    const isLabCertified = req.body.isLabCertified === "true" || req.body.isLabCertified === true || req.body.isLabCertified === "True";
    const isExpertVerified = req.body.isExpertVerified === "true" || req.body.isExpertVerified === true || req.body.isExpertVerified === "True";

    // ✅ Parse size field into array of objects [{name: "Small", price: 100, size: "10mm"}]
    let parsedSizes = [];
    if (size) {
      try {
        parsedSizes = typeof size === "string" ? JSON.parse(size) : size;
      } catch {
        return res.status(400).json({ message: "Invalid size format. Expecting JSON." });
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

    // ✅ Parse benefits into array of strings
    let parsedBenefits;
    if (benefits !== undefined) {
      try {
        if (typeof benefits === "string") {
          parsedBenefits = JSON.parse(benefits);
        } else if (Array.isArray(benefits)) {
          parsedBenefits = benefits;
        }
      } catch (err) {
        // If JSON parse fails, treat as comma-separated string
        parsedBenefits = benefits.split(",").map((b) => b.trim());
      }
    }

    // ✅ Parse removed images
    const parsedRemovedImages = JSON.parse(removedImages);

    // ✅ Check if product exists
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
              await deleteFromCloudinary(url);
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
    // ✅ Upload new images if provided
    let newImageUrls = [];
  
    if (req.files?.imgFile) {
      try {
        const files = Array.isArray(req.files.imgFile)
          ? req.files.imgFile
          : [req.files.imgFile];

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

    if(!discount){
      discount = null
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
        stock,
        subCategory,
        isExclusive,
        isLabCertified: req.body.isLabCertified !== undefined ? isLabCertified : existingProduct.isLabCertified,
        isExpertVerified: req.body.isExpertVerified !== undefined ? isExpertVerified : existingProduct.isExpertVerified,
        keywords,
        benefits: parsedBenefits !== undefined ? parsedBenefits : existingProduct.benefits,
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

// Product Review Controllers
export const addProductReview = async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from JWT token
    const { productID } = req.params;
    const { rating, commentTitle, comment, reviewerName } = req.body;

    // Validate required fields
    if (!rating || !commentTitle || !comment) {
      return res.status(400).json({ message: "Rating, commentTitle, and comment are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Find the product
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product (only if reviewerName is not provided)
    if (!reviewerName) {
      const existingReview = product.reviews.find(
        (review) => review.userID.toString() === userId
      );
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
    }

    // Add review to product
    const reviewData = {
      userID: userId,
      rating,
      commentTitle,
      comment,
    };
    
    // Add reviewerName if provided (for admin-created reviews)
    if (reviewerName) {
      reviewData.reviewerName = reviewerName;
    }

    product.reviews.push(reviewData);

    await product.save();

    // Populate user info in the new review
    await product.populate("reviews.userID", "fullName email");

    const newReview = product.reviews[product.reviews.length - 1];

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProductReview = async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from JWT token
    const { productID, reviewID } = req.params;
    const { rating, commentTitle, comment, reviewerName } = req.body;

    // Find the product
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the review
    const review = product.reviews.id(reviewID);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user owns this review (only enforce if reviewerName is not being set, meaning it's a user update)
    if (!reviewerName && review.userID.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own reviews" });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Update review fields
    if (rating !== undefined) review.rating = rating;
    if (commentTitle !== undefined) review.commentTitle = commentTitle;
    if (comment !== undefined) review.comment = comment;
    if (reviewerName !== undefined) review.reviewerName = reviewerName;
    review.updatedAt = new Date();

    await product.save();

    // Populate user info
    await product.populate("reviews.userID", "fullName email");

    res.status(200).json({
      message: "Review updated successfully",
      review: product.reviews.id(reviewID),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from JWT token
    const { productID, reviewID } = req.params;

    // Find the product
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the review
    const review = product.reviews.id(reviewID);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user owns this review
    if (review.userID.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    // Remove the review
    product.reviews.pull(reviewID);
    await product.save();

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productID } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find the product and populate reviews
    const product = await Product.findById(productID).populate(
      "reviews.userID",
      "fullName email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get total count
    const totalCount = product.reviews ? product.reviews.length : 0;

    // If no reviews, return empty result
    if (totalCount === 0) {
      return res.status(200).json({
        reviews: [],
        stats: {
          averageRating: 0,
          totalRatings: 0,
        },
        totalPages: 0,
        currentPage: parseInt(page),
        totalReviews: 0,
      });
    }

    // Sort reviews by createdAt (newest first) and paginate
    const sortedReviews = product.reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    // Calculate average rating
    const averageRating =
      product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length;

    res.status(200).json({
      reviews: sortedReviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: totalCount,
      },
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      totalReviews: totalCount,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




