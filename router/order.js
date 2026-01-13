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
import { optional_jwt_verify } from '../middleware/optionalVerify.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

// Order creation should be allowed for guests as well as logged-in users,
// so we use optional_jwt_verify which sets userId if token is present but doesn't fail if not
router.post('/create', optional_jwt_verify, createOrder);
router.delete('/:id', verifyAdmin, deleteOrder);
router.get('/user', jwt_verify, getOrdersByUserId);
router.patch('/user/cancel/:orderId', jwt_verify, deleteOrdersByUserId);
router.get("/all", verifyAdmin, getAllOrders)
router.get(":id", getOrderById)
router.put("/:id", verifyAdmin, editOrder)
router.patch("/:id/status", verifyAdmin, updateOrderStatus)
router.patch("/:id/payment", verifyAdmin, updatePaymentStatus)

export default router;