import express from 'express';
import {
  createOrder,
  deleteOrder,
  editOrder,
  getOrdersByUserId,
  deleteOrdersByUserId,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus
} from '../controller/order.js';
import { jwt_verify } from '../middleware/verify.js';

const router = express.Router();

// Order creation should be allowed for guests as well as logged-in users,
// so we don't require jwt_verify middleware here.
router.post('/create', createOrder);
router.delete('/:id', deleteOrder);
router.get('/user',jwt_verify, getOrdersByUserId);
router.patch('/user/cancel/:orderId', jwt_verify, deleteOrdersByUserId);
router.get("/all", getAllOrders)
router.get(":id", getOrderById)
router.put("/:id", editOrder)
router.patch("/:id/status", updateOrderStatus)
router.patch("/:id/payment",updatePaymentStatus)

export default router;