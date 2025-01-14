import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { Cart } from "../models/cart.js";
import Product from "../models/product.js";

export const register = async(req,res)=>{
    try {
        const {fullName, email , password} =  req.body;
        const user = await User.findOne({email});
        if(user){
            res.status(404).json({error :"Email already used!!"})
        }else{
        const passwordhash = await bcrypt.hash(password,10);
        const newUser = new User({
            fullName,
            email,
            password:passwordhash,

        })
        const savedUser = await newUser.save();

        res.status(201).json({msg:"Sucess"})
         }
    } catch (error) {
        res.status(404).json({error :error.message})
    }
}

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
  

export const deleteUser= async(req,res)=>{
    try {
       const id = req.params.id;
       const user = await User.findByIdAndDelete(id);
       if(!user){
        return res.status(404).json({error :"User not found!!"})

    }else{
        return res.status(200).json({msg:"User Deleted"})
    }

    } catch (error) {
       res.status(404).json({error :error.message})
    }
}

// Update User Information
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Username and email are required" });
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
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the old password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
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
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
