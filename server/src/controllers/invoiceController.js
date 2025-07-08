import mongoose from 'mongoose';
import Order from '../models/orderSchema.js';
import User from '../models/UserSchema.js';
import { generateInvoicePDF } from '../utils/pdfInvoiceGenerator.js';

export const getInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Order ID' });
    }

    const order = await Order.findOne({ _id:id, userId })
      .populate('services.service')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const studio = await User.findById(userId).lean();

    const pdfBuffer = await generateInvoicePDF(order, studio);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `inline; filename=Invoice-${order.invoiceNumber || _id}.pdf`,
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.log('❌ Error generating invoice:', error);
    res.status(500).json({ message: 'PDF generation failed', error: error.message });
  }
};
