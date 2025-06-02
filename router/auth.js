import express from "express";
import {
  register,
  login,
  deleteUser,
  updateUser,
  changePassword,
  resetPassword,
  otpSend,
  emailVerify,
  adminLogin,
  adminRegister,
  addToWishlist,
  removeFromWishlist,
  getWishlistByUserId,
} from "../controller/auth.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/deleteUser/:id", deleteUser);
router.put("/updateUser/:id", updateUser);
router.put("/changePassword/:id", changePassword);
router.post("/otpSend", otpSend);
router.post("/resetPassword", resetPassword);
router.post("/verifyEmail", emailVerify);
router.post("/admin/login", adminLogin);
router.post("/admin/register", adminRegister);
router.post("/addwishlist", addToWishlist);
router.delete("/deletewishlist/:userId/:productId", removeFromWishlist);
router.get("/wishlist/:userId", getWishlistByUserId);

export default router;
