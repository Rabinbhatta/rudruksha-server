import Product from "../models/product.js";
import {v2 as cloudinary} from "cloudinary"

export const createProduct = async(req,res)=>{
    try {
        const {
            title,
            price,
            category,
            description,
            faces,
            country,
            weight,
            size
        } = req.body;
        const isSale = req.body.isSale == "true"
        const isTopSelling = req.body.isSale == "true"
        const isSpecial = req.body.isSpecial == "true"
    
        // Check if files were uploaded
        if (!req.files || !req.files.img) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
    
        // Handle single or multiple images
        const files = Array.isArray(req.files.img) ? req.files.img : [req.files.img];
        
        // Upload all images to Cloudinary
        const uploadResults = await Promise.all(
            files.map(file => cloudinary.uploader.upload(file.tempFilePath))
        );
    
        // Get the secure URLs of uploaded images
        const imageUrls = uploadResults.map(result => result.secure_url);
    
        // Create a new product
        const product = new Product({
            title,
            price,
            category,
            img: imageUrls, // Store all image URLs in an array
            description,
            isSale,
            faces,
            isSpecial,
            country,
            isTopSelling,
            weight,
            size
        });
    
        // Save the product to the database
        const savedProduct = await product.save();
    
        res.status(201).json({ savedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
}

export const deleteProduct= async(req,res)=>{
    try {
       const id = req.params.id;
       const user = await Product.findByIdAndDelete(id);
       if(!user){
        res.status(404).json({error :"Product not found!!"})

    }else{
        res.status(200).json({msg:"Product Deleted"})
    }

    } catch (error) {
       res.status(404).json({error :error.message})
    }
}

export const editProduct = async (req, res) => {
    try {
      const { id } = req.params; // Assuming the product ID is sent as a URL parameter
      const { name, price, category, description, isSale, faces, isSpecial, country,stock } = req.body; // Extract fields from the request body
  
      // Check if an image file is included
      let updatedImg = req.body.img; // Keep current image URLs if no file is provided
      if (req.files && req.files.img) {
        const files = Array.isArray(req.files.img) ? req.files.img : [req.files.img];
        updatedImg = [];
  
        // Upload each image to Cloudinary
        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.tempFilePath);
          updatedImg.push(result.secure_url); // Add the uploaded image URL
        }
      }
  
      // Update the product in the database
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          price,
          category,
          img: updatedImg,
          description,
          isSale,
          faces,
          isSpecial,
          country,
          stock
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      res.status(200).json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const searchProduct = async(req,res)=>{
  try {
    const { title="" , description="" ,page=1,limit=8 } = req.query;
    const parsedTitle = isNaN(title) ? title : title.toString();
    const parsedDescription = isNaN(description) ? description : description.toString();
    const products = await Product.find({$and:[{ title: { $regex:parsedTitle, $options: 'i' } },{description:{$regex:parsedDescription,$options:'i'}}]}).skip((page - 1) * limit).limit(limit);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
  