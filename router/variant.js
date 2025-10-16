import express from 'express';
import { createVariant, getVariant, updateVariant, deleteVariant } from '../controller/variant.js';

const router = express.Router();

router.post('/create', createVariant);
router.get('/get/', getVariant);
router.put('/update/:id', updateVariant);
router.delete('/delete/:id', deleteVariant);

export default router;