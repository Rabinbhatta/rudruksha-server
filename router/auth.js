import express from "express";
import {
  register,
  login,
  deleteUser,
  updateUser,
  changePassword,
  forgetPassword,
  resetPassword,
} from "../controller/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/deleteUser/:id", deleteUser);
router.put("/updateUser/:id", updateUser);
router.put("/changePassword/:id", changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);

export default router;
