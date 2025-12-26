import express from 'express';
import { createReview, getReview, deleteReview } from '../controller/review.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.post('/create', createReview);
router.get("/get", getReview);
router.delete("/delete/:id", verifyAdmin, deleteReview);


export default router;