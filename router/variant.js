import express from 'express';
import { createVariant, getVariant, updateVariant, deleteVariant } from '../controller/variant.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.post('/create', verifyAdmin, createVariant);
router.get('/get/', getVariant);
router.put('/update/:id', verifyAdmin, updateVariant);
router.delete('/delete/:id', verifyAdmin, deleteVariant);

export default router;