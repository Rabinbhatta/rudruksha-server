import express from 'express';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controller/blog.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/Blogs', getBlogs);
router.get('/posts/:id', getBlogById);
router.post('/posts', verifyAdmin, createBlog);
router.put('/posts/:id', verifyAdmin, updateBlog);
router.delete('/posts/:id', verifyAdmin, deleteBlog);

export default router;