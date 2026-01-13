import express from 'express';

import {
    getContacts, getContactById, createContact, updateContact, deleteContact, submitContactForm,
    getContactSubmissions, getContactSubmissionById, markContactSubmissionAsRead, deleteContactSubmission
} from '../controller/contact.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();
router.get('/', getContacts);
router.post('/submit', submitContactForm); // Public endpoint for contact form submissions
router.get('/submissions', verifyAdmin, getContactSubmissions); // Get all contact submissions (admin)
router.get('/submissions/:id', verifyAdmin, getContactSubmissionById); // Get single submission (admin)
router.put('/submissions/:id/read', verifyAdmin, markContactSubmissionAsRead); // Mark as read (admin)
router.delete('/submissions/:id', verifyAdmin, deleteContactSubmission); // Delete submission (admin)
router.get('/:id', verifyAdmin, getContactById);
router.post('/', createContact);
router.put('/:id', verifyAdmin, updateContact);
router.delete('/:id', verifyAdmin, deleteContact);

export default router;