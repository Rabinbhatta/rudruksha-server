import express from 'express';

import {
    getContacts, getContactById, createContact, updateContact, deleteContact
} from '../controller/contact.js';

const router = express.Router();
router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;