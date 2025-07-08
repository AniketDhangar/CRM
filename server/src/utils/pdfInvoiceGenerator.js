import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (order, studio) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
    doc.on('error', reject); // catch errors

    const bold = 'Helvetica-Bold';
    const regular = 'Helvetica';

    // Header
    doc.font(bold).fontSize(18).text(studio.studioName || 'Studio Name', { align: 'left' });
    doc.font(regular).fontSize(10).text(`Address: ${studio.studioLocation || '-'}`);
    if (studio.gstNumber) doc.text(`GST No: ${studio.gstNumber}`);
    doc.moveDown();

    // Invoice Info
    doc.font(bold).text('INVOICE', { align: 'right' });
    doc.font(regular).text(`Invoice #: ${order.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Customer Info
    doc.font(bold).text('BILL TO:');
    const customer = order.customerSnapshot || {};
    doc.font(regular)
      .text(`Name: ${customer.name || '-'}`)
      .text(`Mobile: ${customer.mobile || '-'}`);
    if (customer.email) doc.text(`Email: ${customer.email}`);
    if (customer.city) doc.text(`City: ${customer.city}`);
    if (order.venue) doc.text(`Venue: ${order.venue}`);
    doc.moveDown();

    // Table Header
    doc.font(bold);
    doc.text('Service', 50, doc.y, { width: 160 });
    doc.text('Qty', 200, doc.y, { width: 50, align: 'right' });
    doc.text('Days', 250, doc.y, { width: 50, align: 'right' });
    doc.text('Rate', 300, doc.y, { width: 100, align: 'right' });
    doc.text('Total', 400, doc.y, { width: 100, align: 'right' });
    doc.moveDown(5);
    doc.font(regular);

    // Table Rows
    order.services.forEach(item => {
      const name = item?.service?.name || 'Unnamed';
      doc.text(name, 50, doc.y, { width: 160 });
      doc.text(item.qty?.toString() || '-', 200, doc.y, { width: 50, align: 'right' });
      doc.text(item.days?.toString() || '-', 250, doc.y, { width: 50, align: 'right' });
      doc.text(`₹${item.salePrice}`, 250, doc.y, { width: 100, align: 'right' });
      doc.text(`₹${item.total}`, 400, doc.y, { width: 100, align: 'right' });
      doc.moveDown(0.2);
    });

    // Totals
    doc.moveDown();
    const subtotal = order.finalTotal + order.discount - order.tax;
    doc.font(bold).text(`Subtotal: ₹${subtotal}`, { align: 'right' });
    doc.font(regular).text(`Tax: ₹${order.tax}`, { align: 'right' });
    doc.text(`Discount: ₹${order.discount}`, { align: 'right' });
    doc.text(`Advance Paid: ₹${order.advanceAmount}`, { align: 'right' });
    doc.font(bold).text(`Due Amount: ₹${order.dueAmount}`, { align: 'right' });

    // Footer
    doc.moveDown();
    doc.font(regular).fontSize(10).text(studio.invoiceFooterNote || 'Thank you for choosing us!', {
      align: 'center',
      underline: true,
    });

    doc.end();
  });
};
