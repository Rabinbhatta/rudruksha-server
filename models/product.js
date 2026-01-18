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
      name: { type: String }, // e.g., "Small", "Medium", "Large"
      price: { type: Number },
      size: { type: String }, // e.g., "10mm", "12mm"
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
  isLabCertified: {
    type: Boolean,
    default: false,
  },
  isExpertVerified: {
    type: Boolean,
    default: false,
  },
  slug :{
    type: String,
    unique: true,
  },
  youtubeLink: {
    type: String,
  },
  keywords: {
    type: Array,
  },
  benefits: {
    type: [String],
    default: [],
  },
  discount:[{title: String, percentage: Number}],
  promoEnabled: {
    type: Boolean,
    default: false,
  },
  allowedPromoCodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromoCode'
  }],
  defaultVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant'  },
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }],
  reviews: [{
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerName: { type: String }, // Optional custom name for admin-created reviews
    rating: { type: Number, required: true, min: 1, max: 5 },
    commentTitle: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
});

ProductSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
  
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
