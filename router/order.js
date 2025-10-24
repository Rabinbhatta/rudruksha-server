import express from 'express';
import {
  createOrder,
  deleteOrder,
  editOrder,
  getOrdersByUserId
} from '../controller/order.js';
import { jwt_verify } from '../middleware/verify.js';

const router = express.Router();

router.post('/create', jwt_verify, createOrder);
router.delete('/delete/:id', deleteOrder);
router.patch('/update/:id', editOrder);
router.get('/user', getOrdersByUserId);


export default router;