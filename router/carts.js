import express from 'express';
import { addCart, removeCart, updateCart } from '../controller/carts.js';

const router = express.Router();

router.post('/add',addCart)
router.delete('/remove',removeCart)
router.patch('/update',updateCart)

export default router