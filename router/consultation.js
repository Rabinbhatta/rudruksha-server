import express from 'express';
import { getConsultation,createConsultation } from '../controller/consultation.js';

const router = express.Router();

router.get('/get', getConsultation);
router.post('/create', createConsultation);

export default router;