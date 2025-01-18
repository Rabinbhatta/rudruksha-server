import express from 'express';
import { addCart, getCartByUserId, removeCart, updateCart } from '../controller/carts.js';

const router = express.Router();

router.post('/add',addCart)
router.delete('/remove',removeCart)
router.patch('/update',updateCart)
router.get("/get/:userId",getCartByUserId)

export default router