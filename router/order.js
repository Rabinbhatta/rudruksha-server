import express from 'express';
import {
  createOrder,
  deleteOrder,
  editOrder,
  getOrdersByUserId
} from '../controller/order.js';

const router = express.Router();

router.post('/create', createOrder);
router.delete('/delete/:id', deleteOrder);
router.patch('/update/:id', editOrder);
router.get('/user', getOrdersByUserId);


export default router;