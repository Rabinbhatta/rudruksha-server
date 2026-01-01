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
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

// Order creation should be allowed for guests as well as logged-in users,
// so we don't require jwt_verify middleware here.
router.post('/create', createOrder);
router.delete('/:id', verifyAdmin, deleteOrder);
router.get('/user', jwt_verify, getOrdersByUserId);
router.patch('/user/cancel/:orderId', jwt_verify, deleteOrdersByUserId);
router.get("/all", verifyAdmin, getAllOrders)
router.get(":id", getOrderById)
router.put("/:id", verifyAdmin, editOrder)
router.patch("/:id/status", verifyAdmin, updateOrderStatus)
router.patch("/:id/payment", verifyAdmin, updatePaymentStatus)

export default router;