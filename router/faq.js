import express from 'express';

import { getFAQs, getFAQById, createFAQ, updateFAQ, deleteFAQ } from '../controller/faq.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getFAQs);
router.get('/:id', getFAQById);
router.post('/', verifyAdmin, createFAQ);
router.put('/:id', verifyAdmin, updateFAQ);
router.delete('/:id', verifyAdmin, deleteFAQ);

export default router;