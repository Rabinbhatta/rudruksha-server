import mongoose from "mongoose";
import slugify from "slugify";

const ProductSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
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
  size: [
    {
      name: { type: String },
      price: { type: Number },
    }
  ],
  weightSizeOptions: [
    {
      weight: { type: String },
      size: { type: String  },
    }
  ],
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
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
  },
  isExclusive: {
    type: Boolean,
    required: true,
  },
  slug :{
    type: String,
    unique: true,
  },
  keywords: {
    type: Array,
  },
  discount:[{title: String, percentage: Number}],
  defaultVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant'  },
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }],
});

ProductSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
