import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    views: {
        type: Number,
        default: 0,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;