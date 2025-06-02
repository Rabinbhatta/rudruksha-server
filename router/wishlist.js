import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getWishlistByUserId,
} from "../controller/wishlist.js";

const router = express.Router();

// Route to get the wishlist
router.get("/", getWishlist);
// Route to add an item to the wishlist
router.post("/add", addToWishlist);
// Route to remove an item from the wishlist
router.delete("/remove/:id", removeFromWishlist);

router.get("/:id", getWishlistByUserId);

export default router;
