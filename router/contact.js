import express from 'express';

import {
    getContacts, getContactById, createContact, updateContact, deleteContact
} from '../controller/contact.js';
import { verifyAdmin } from '../middleware/admin.js';

const router = express.Router();
router.get('/', verifyAdmin, getContacts);
router.get('/:id', verifyAdmin, getContactById);
router.post('/', createContact);
router.put('/:id', verifyAdmin, updateContact);
router.delete('/:id', verifyAdmin, deleteContact);

export default router;