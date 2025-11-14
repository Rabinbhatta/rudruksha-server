import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  banners: {
    type: [String], // Array of banner URLs
    validate: [arrayLimit, '{PATH} exceeds the limit of 3'],
    default: []
  }
}, { timestamps: true });

// Validator to ensure max 3 banners
function arrayLimit(val) {
  return val.length <= 3;
}

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner
