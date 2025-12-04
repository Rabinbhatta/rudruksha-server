import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  name: { type: String,unique: true, required: true },

  images: {
    type: [String],   // Array of image URLs
    validate: {
      validator: function (val) {
        return val.length <= 3;
      },
      message: "Maximum 3 banner images allowed"
    },
    default: []
  }
}, { timestamps: true });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
