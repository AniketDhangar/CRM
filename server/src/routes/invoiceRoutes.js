import express from 'express';
import { getInvoicePDF } from '../controllers/invoiceController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/:id/invoice', verifyToken, getInvoicePDF);

export default router;
