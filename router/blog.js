import express from 'express';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controller/blog.js';

const router = express.Router();

router.get('/Blogs', getBlogs);
router.get('/posts/:id', getBlogById);
router.post('/posts', createBlog);
router.put('/posts/:id', updateBlog);
router.delete('/posts/:id', deleteBlog);

export default router;