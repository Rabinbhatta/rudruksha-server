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
        required: false,
    },
    author: {
        type: String,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    author: {
        type: String,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;