import Product from "../models/product.js";
import {v2 as cloudinary} from "cloudinary"

export const createProduct = async(req,res)=>{
    try {
        const {name,price,category} = req.body
        if (!req.files || !req.files.img) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
       const file =  req.files.img
       const result = await cloudinary.uploader.upload(file.tempFilePath)
       const product = new Product({
        name,
        price,
        category,
        img:result.secure_url
       })

       const saveProduct = await product.save()
       res.status(201).json({saveProduct})

    } catch (error) {
        res.status(404).json({error :error.message})
    }

}