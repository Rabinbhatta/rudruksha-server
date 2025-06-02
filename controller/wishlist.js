import { Wishlist } from "../models/wishlist.js";
import Product from "../models/product.js";

export const getWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Get pagination parameters from query
    const skip = (page - 1) * limit; // Calculate the number of items to skip
    const wishlist = await Wishlist.find()
      .skip(skip)
      .limit(limit)
      .populate("products.productId"); // Populate product details

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWishlistByUserId = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request parameters
    const wishlist = await Wishlist.findOne({ userId }).populate(
      "products.productId"
    );

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist by user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { userId, products } = req.body; // Assuming user ID is stored in req.user

    // Find or create the wishlist for the user
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    for (const product of products) {
      const { productId, quantity = 1 } = product; // Default quantity to 1 if not provided

      // Check if the product already exists in the wishlist
      const existingProductIndex = wishlist.products.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (existingProductIndex !== -1) {
        // If it exists, update the quantity and total price
        wishlist.products[existingProductIndex].quantity += quantity;
        wishlist.products[existingProductIndex].totalPrice +=
          (await Product.findById(productId)).price * quantity;
      } else {
        // If it doesn't exist, add a new product entry
        const productDetails = await Product.findById(productId);
        if (!productDetails) {
          return res.status(404).json({ message: "Product not found" });
        }

        wishlist.products.push({
          productId,
          quantity,
          totalPrice: productDetails.price * quantity,
          addedAt: new Date(),
        });
      }
    }
    await wishlist.save();

    res.status(201).json(wishlist);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is stored in req.user
    const { id } = req.params;

    // Find the wishlist for the user
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Find the product in the wishlist
    const productIndex = wishlist.products.findIndex(
      (p) => p.productId.toString() === id
    );
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    // Remove the product from the wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
