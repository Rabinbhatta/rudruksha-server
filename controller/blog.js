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
    // Map thumbnail to image for frontend compatibility
    const blogsWithImage = blogs.map(blog => {
      const blogObj = blog.toObject();
      blogObj.image = blogObj.thumbnail;
      return blogObj;
    });
    res.status(200).json(blogsWithImage);
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
    // Map thumbnail to image for frontend compatibility
    const blogResponse = blog.toObject();
    blogResponse.image = blogResponse.thumbnail;
    res.status(200).json(blogResponse);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "An error occurred while fetching the blog." });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content, author, imageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    let thumbnailUrl = null;

    // Handle file upload (FormData)
    if (req.files && req.files.image) {
      const file = req.files.image;
      if (file.tempFilePath) {
        thumbnailUrl = await uploadToCloudinary(file.tempFilePath);
      } else {
        return res.status(400).json({ error: "Invalid file upload" });
      }
    } 
    // Handle imageUrl from JSON request
    else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      thumbnailUrl = imageUrl.trim();
    }
    // Handle base64 image from JSON request
    else if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      // For base64 images, you might want to upload to Cloudinary or store as-is
      // For now, we'll store the base64 string directly
      thumbnailUrl = req.body.image;
    }

    const newBlog = new Blog({ 
      title, 
      content, 
      ...(author && { author }),
      ...(thumbnailUrl && { thumbnail: thumbnailUrl })
    });
    await newBlog.save();
    
    // Map thumbnail to image for frontend compatibility
    const blogResponse = newBlog.toObject();
    blogResponse.image = blogResponse.thumbnail;
    res.status(201).json(blogResponse);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "An error occurred while creating the blog." });
  }
};

export const updateBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const { title, content, author, isActive, imageUrl } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (author !== undefined) updateData.author = author;
    if (isActive !== undefined) updateData.isActive = isActive;

    let thumbnailUrl = null;

    // Handle file upload (FormData) - new image file
    if (req.files && req.files.image) {
      const file = req.files.image;
      if (file.tempFilePath) {
        // Delete old thumbnail if it exists
        if (blog.thumbnail && blog.thumbnail.startsWith('http')) {
          try {
            await deleteFromCloudinary(blog.thumbnail);
          } catch (error) {
            console.error("Error deleting old thumbnail:", error);
            // Continue even if deletion fails
          }
        }
        thumbnailUrl = await uploadToCloudinary(file.tempFilePath);
        updateData.thumbnail = thumbnailUrl;
      }
    } 
    // Handle imageUrl from JSON request
    else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      // Only update if it's different from current thumbnail
      if (imageUrl !== blog.thumbnail) {
        // Delete old thumbnail if it exists and is a Cloudinary URL
        if (blog.thumbnail && blog.thumbnail.startsWith('http') && !imageUrl.startsWith('http')) {
          try {
            await deleteFromCloudinary(blog.thumbnail);
          } catch (error) {
            console.error("Error deleting old thumbnail:", error);
          }
        }
        updateData.thumbnail = imageUrl.trim();
      }
    }
    // Handle base64 image from JSON request
    else if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      // Delete old thumbnail if it exists and is a Cloudinary URL
      if (blog.thumbnail && blog.thumbnail.startsWith('http')) {
        try {
          await deleteFromCloudinary(blog.thumbnail);
        } catch (error) {
          console.error("Error deleting old thumbnail:", error);
        }
      }
      updateData.thumbnail = req.body.image;
    }
    // If no image is provided, keep the existing thumbnail

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    // Map thumbnail to image for frontend compatibility
    const blogResponse = updatedBlog.toObject();
    blogResponse.image = blogResponse.thumbnail;
    res.status(200).json(blogResponse);
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
