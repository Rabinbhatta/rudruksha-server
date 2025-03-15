// prettier-ignore
import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Cart } from "../models/cart.js";
import Product from "../models/product.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Admin from "../models/admin.js";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "Email already used!" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Create user but don't verify yet
    const newUser = new User({
      fullName,
      email,
      password: passwordHash,
      otp,
      otpExpires,
      isVerified: false, // Mark as unverified initially
    });

    await newUser.save();

    // Send OTP Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email OTP",
      text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "OTP sent to email. Verify within 10 mins!" });

    // Schedule deletion if not verified within 10 minutes
    setTimeout(async () => {
      const checkUser = await User.findOne({ email });
      if (checkUser && !checkUser.isVerified) {
        await User.deleteOne({ email });
        console.log(
          `User with email ${email} deleted due to OTP not being verified.`
        );
      }
    }, 2 * 60 * 1000); // 10 minutes
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const cart = await Cart.findOne({ userId: user._id });
    let productDetails = [];

    if (cart) {
      productDetails = await Promise.all(
        cart.products.map(async (item) => {
          const product = await Product.findById(item.productId);
          if (product) {
            return {
              ...product.toObject(),
              quantity: item.quantity,
              totalPrice: item.total,
            };
          }
          return null;
        })
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({ error: "Wrong password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);
    return res.status(200).json({
      jwt: token,
      user: {
        name: user.fullName,
        email: user.email,
        id: user._id,
        cart: productDetails,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found!!" });
    } else {
      return res.status(200).json({ msg: "User Deleted" });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update User Information
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required" });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user information
    user.name = name;
    user.email = email;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id; // Assuming the user ID is available in the request (e.g., from authentication middleware)

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the old password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // prettier-ignore
    user:process.env.EMAIL_USER,
    // prettier-ignore
    pass:process.env.EMAIL_PASS,
  },
});

export const otpSend = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();
    const subject = user.isVerified ? "Password Reset OTP" : "Verify Email OTP";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: `Your OTP code is: ${otp}`,
    };

    // Use async/await for sending the email
    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "OTP sent to email" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ message: "Error sending OTP", error: error.message });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const emailVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found!" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(404).json({ error: "Wrong password!" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_KEY);
    return res.status(200).json({
      jwt: token,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });
    if (user) {
      res.status(404).json({ error: "Email already used!!" });
    } else {
      const passwordhash = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({
        email,
        password: passwordhash,
      });
      const savedUser = await newAdmin.save();

      res.status(201).json({ savedUser });
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
