import express from 'express';

import { getFAQs, getFAQById, createFAQ, updateFAQ, deleteFAQ } from '../controller/faq.js';

const router = express.Router();

router.get('/', getFAQs);
router.get('/:id', getFAQById);
router.post('/', createFAQ);
router.put('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);

export default router;