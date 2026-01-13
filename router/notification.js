import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controller/notification.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', verifyAdmin, getNotifications);
router.get('/unread-count', verifyAdmin, getUnreadCount);
router.put('/:id/read', verifyAdmin, markAsRead);
router.put('/mark-all-read', verifyAdmin, markAllAsRead);
router.delete('/:id', verifyAdmin, deleteNotification);

export default router;
