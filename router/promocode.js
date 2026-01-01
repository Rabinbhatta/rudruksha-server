import express from 'express';
import {
  createPromocode,
  deletePromocode,
  editPromocode,
  listPromocodes,
  applyPromocode
} from '../controller/promocode.js';
import { jwt_verify } from '../middleware/verify.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.post('/create', verifyAdmin, createPromocode);
router.delete('/delete/:id', verifyAdmin, deletePromocode);
router.patch('/update/:id', verifyAdmin, editPromocode);
router.get('/list', verifyAdmin, listPromocodes);
router.put('/apply', jwt_verify, applyPromocode);

export default router;