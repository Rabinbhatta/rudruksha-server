import express from 'express';
import {
  createPromocode,
  deletePromocode,
  editPromocode,
  listPromocodes,
  applyPromocode
} from '../controller/promocode.js';
import { jwt_verify } from '../middleware/verify.js';

const router = express.Router();

router.post('/create', createPromocode);
router.delete('/delete/:id', deletePromocode);
router.patch('/update/:id', editPromocode);
router.get('/list', listPromocodes);
router.put('/apply', jwt_verify, applyPromocode);

export default router;