import mongoose from "mongoose";

const mediaItemSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "youtube"], required: true },
  url: { type: String, required: true },
});

const uploadSchema = new mongoose.Schema({
  media: [mediaItemSchema], // array of media items
}, { timestamps: true });

export default mongoose.model("Upload", uploadSchema);
