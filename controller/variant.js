import  Variant  from "../models/variant.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";


export const createVariant = async (req, res) => {
  try {
    const { name, price, stock, isDefault } = req.body;
    if (!req.files || !req.files.img) {
      return res.status(404).json({ message: "No files uploaded" });
    }
    const imgUrl = await uploadToCloudinary(req.files.img.tempFilePath);
    const variant = new Variant({ name, price, stock, isDefault, imgUrl });
    const savedVariant = await variant.save();
    res.status(201).json({ savedVariant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const getVariant = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Fetch paginated variants
    const variants = await Variant.find()
      .skip(skip)
      .limit(limit);

    const total = await Variant.countDocuments();

    res.status(200).json({
      data: variants,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};


export const updateVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock, isDefault } = req.body;
        let imgUrl;
        const variant = await Variant.findById(id);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        if (req.files && req.files.img) {
            await deleteFromCloudinary(variant.imgUrl);
            const uploadResult = await cloudinary.uploader.upload(req.files.img.tempFilePath);
            imgUrl = uploadResult.secure_url;
        }
        const updatedData = { name, price, stock, isDefault };
        if (imgUrl) updatedData.imgUrl = imgUrl;
        const updatedVariant = await Variant.findByIdAndUpdate
           (id, updatedData, { new: true });
        if (!updatedVariant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        res.status(200).json(updatedVariant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};

export const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params; 
        const variant = await Variant.findById(id);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        await deleteFromCloudinary(variant.imgUrl); 
        const deletedVariant = await Variant.findByIdAndDelete(id);
        if (!deletedVariant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        res.status(200).json({ message: "Variant deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};