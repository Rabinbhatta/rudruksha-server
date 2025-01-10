import express from 'express';
import { createReview,getReview,deleteReview } from '../controller/review.js';

const router = express.Router();

router.post('/create',createReview);
router.get("/get",getReview);
router.delete("/delete/:id",deleteReview);


export default router;