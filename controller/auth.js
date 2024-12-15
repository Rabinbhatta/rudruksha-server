import User from "../models/user.js";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary"
import jwt from "jsonwebtoken"

export const register = async(req,res)=>{
    try {
        const {fullName, email , password , phone,address} =  req.body;
        const user = await User.findOne({email});
        if(user){
            res.status(404).json({error :"Email already used!!"})
        }else{
        const passwordhash = await bcrypt.hash(password,10);
        const newUser = new User({
            fullName,
            email,
            phone,
            password:passwordhash,
            address
        })
        const savedUser = await newUser.save();

        res.status(201).json({msg:"Sucess"})
         }
    } catch (error) {
        res.status(404).json({error :error.message})
    }
}

export const login = async(req,res)=>{
    try {
       const {email , password} = req.body;
       const user = await  User.findOne({email});
       if(!user){
           res.status(404).json({error :"User not found!!"})

       }
       const isMatch = await bcrypt.compare(password,user.password)
       if(!isMatch){
           res.status(404).json({error :"Wrong password!!"})
       }else{
       const token =  jwt.sign(user.id,process.env.JWT_KEY)
       res.cookie('token', token, {
           maxAge: 3600000,
           httpOnly: true,
           
       });
       res.status(200).json({jwt:token,user:{name:user.fullName,email:user.email,id:user._id}});}    
    } catch (error) {
       res.status(404).json({error :error.message})
    }
}