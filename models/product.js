import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  img: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  isSale: {
    type: Boolean,
    required: true,
  },
  faces: {
    type: String,
    required: true,
  },
  isSpecial: {
    type: Boolean,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  isTopSelling: {
    type: Boolean,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  isExclusive: {
    type: Boolean,
    required: true,
  },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
