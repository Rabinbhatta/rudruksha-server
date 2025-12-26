import Blog from "../models/blog.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const blogs = await Blog.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching blogs." });
  }
};

export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "An error occurred while fetching the blog." });
  }
};

export const createBlog = async (req, res) => {
  const { title, content, author } = req.body;
  const thumbnail = req.files.image ? req.files.image : null;
  try {
    const thumbnailUrl = await uploadToCloudinary(thumbnail.tempFilePath);
    console.log("Uploaded thumbnail URL:", thumbnailUrl);
    const newBlog = new Blog({ title, content, thumbnail: thumbnailUrl, author });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "An error occurred while creating the blog." });
  }
};

export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, isActive, author } = req.body;
  const thumbnail = req.files ? req.files.image : null;
  try {
    const blog = await Blog.findById(
      id
    );
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    let thumbnailUrl
    if (thumbnail) {
      thumbnailUrl = await uploadToCloudinary(thumbnail.tempFilePath);
      await deleteFromCloudinary(blog.thumbnail);
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content, author, isActive, ...(thumbnailUrl && { thumbnail: thumbnailUrl }) },
      { new: true }
    );
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "An error occurred while updating the blog." });
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "An error occurred while deleting the blog." });
  }
};
