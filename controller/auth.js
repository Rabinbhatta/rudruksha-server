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
        res.status(404).json({error :"User not found!!"})

    }else{
        res.status(200).json({msg:"User Deleted"})
    }

    } catch (error) {
       res.status(404).json({error :error.message})
    }
}

