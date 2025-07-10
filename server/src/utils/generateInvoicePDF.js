import PdfPrinter from "pdfmake";

const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export const generateInvoicePDF = async (order, studio, type = "invoice") => {
  const customer = order.customerSnapshot || {};
  const currentDate = new Date(order.createdAt);
  const dueDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from creation

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header Section with Logo Placeholder and Studio Info
      {
        columns: [
          {
            width: '60%',
            stack: [
              {
                text: studio?.studioName || "Studio Name",
                style: 'companyName',
                margin: [0, 0, 0, 5]
              },
              {
                text: studio?.studioLocation || "Studio Location",
                style: 'companyAddress',
                margin: [0, 0, 0, 3]
              },
              {
                text: studio?.studioPhone || "Phone: +91 1234567890",
                style: 'companyContact',
                margin: [0, 0, 0, 3]
              },
              {
                text: studio?.studioEmail || "Email: info@studio.com",
                style: 'companyContact',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          {
            width: '40%',
            stack: [
              {
                text: type.toUpperCase(),
                style: 'documentType',
                alignment: 'right',
                margin: [0, 0, 0, 10]
              },
              {
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: [
                          { text: 'INVOICE #: ', style: 'label' },
                          { text: order.invoiceNumber || 'INV-001', style: 'value' }
                        ]
                      }
                    ],
                    [
                      {
                        text: [
                          { text: 'DATE: ', style: 'label' },
                          { text: currentDate.toLocaleDateString('en-IN'), style: 'value' }
                        ]
                      }
                    ],
                    [
          {
            text: [
                          { text: 'DUE DATE: ', style: 'label' },
                          { text: dueDate.toLocaleDateString('en-IN'), style: 'value' }
                        ]
                      }
                    ]
                  ]
                },
                layout: {
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                  paddingLeft: () => 0,
                  paddingRight: () => 0,
                  paddingTop: () => 3,
                  paddingBottom: () => 3,
                }
              }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Customer and Studio Information
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: 'BILL TO',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
              },
              {
                table: {
                  widths: ['*'],
                  body: [
                    [{ text: customer.name || 'Customer Name', style: 'customerName' }],
                    [{ text: customer.mobile || 'Mobile: +91 9876543210', style: 'customerInfo' }],
                    [{ text: customer.city || 'City, State', style: 'customerInfo' }],
                    [{ text: customer.address || 'Address Line 1', style: 'customerInfo' }],
                    [{ text: customer.pincode || 'PIN Code', style: 'customerInfo' }]
                  ]
                },
                layout: {
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                  paddingLeft: () => 0,
                  paddingRight: () => 0,
                  paddingTop: () => 2,
                  paddingBottom: () => 2,
                }
              }
            ]
          },
          {
            width: '50%',
            stack: [
              {
                text: 'FROM',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
              },
              {
                table: {
                  widths: ['*'],
                  body: [
                    [{ text: studio?.studioName || 'Studio Name', style: 'studioName' }],
                    [{ text: studio?.studioLocation || 'Studio Location', style: 'studioInfo' }],
                    [{ text: studio?.studioPhone || 'Phone: +91 1234567890', style: 'studioInfo' }],
                    [{ text: studio?.studioEmail || 'Email: info@studio.com', style: 'studioInfo' }],
                    [{ text: studio?.studioGST || 'GST: 12ABCDE1234F1Z5', style: 'studioInfo' }]
                  ]
                },
                layout: {
                  hLineWidth: () => 0,
                  vLineWidth: () => 0,
                  paddingLeft: () => 0,
                  paddingRight: () => 0,
                  paddingTop: () => 2,
                  paddingBottom: () => 2,
                }
              }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Services Table
      {
        text: 'SERVICES',
        style: 'sectionHeader',
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'DESCRIPTION', style: 'tableHeader' },
              { text: 'QTY', style: 'tableHeader' },
              { text: 'DAYS', style: 'tableHeader' },
              { text: 'RATE (₹)', style: 'tableHeader' },
              { text: 'AMOUNT (₹)', style: 'tableHeader' }
            ],
            ...order.services.map((item) => [
              { text: item.service?.name || 'Service Name', style: 'tableCell' },
              { text: item.qty.toString(), style: 'tableCell', alignment: 'center' },
              { text: item.days.toString(), style: 'tableCell', alignment: 'center' },
              { text: item.salePrice.toLocaleString('en-IN'), style: 'tableCell', alignment: 'right' },
              { text: item.total.toLocaleString('en-IN'), style: 'tableCell', alignment: 'right' }
            ])
          ]
        },
        layout: {
          hLineWidth: (i, node) => {
            return (i === 0 || i === node.table.body.length) ? 1.5 : 0.5;
          },
          vLineWidth: () => 0.5,
          hLineColor: (i, node) => {
            return (i === 0 || i === node.table.body.length) ? '#2c3e50' : '#bdc3c7';
          },
          vLineColor: () => '#bdc3c7',
          paddingLeft: () => 12,
          paddingRight: () => 12,
          paddingTop: () => 8,
          paddingBottom: () => 8,
          fillColor: (rowIndex) => {
            return rowIndex === 0 ? '#ecf0f1' : null;
          }
        },
        margin: [0, 0, 0, 20]
      },

      // Summary Section
{
  columns: [
    { width: '*', text: '' },
    {
            width: '40%',
      table: {
              widths: ['60%', '40%'],
        body: [
                [
                  { text: 'Subtotal', style: 'summaryLabel' },
                  { text: `₹${(order.finalTotal + order.discount - order.tax).toLocaleString('en-IN')}`, style: 'summaryValue', alignment: 'right' }
                ],
                [
                  { text: 'Tax (18%)', style: 'summaryLabel' },
                  { text: `₹${order.tax.toLocaleString('en-IN')}`, style: 'summaryValue', alignment: 'right' }
                ],
                [
                  { text: 'Discount', style: 'summaryLabel' },
                  { text: `₹${order.discount.toLocaleString('en-IN')}`, style: 'summaryValue', alignment: 'right' }
                ],
                [
                  { text: 'Advance Paid', style: 'summaryLabel' },
                  { text: `₹${order.advanceAmount.toLocaleString('en-IN')}`, style: 'summaryValue', alignment: 'right' }
                ],
                [
                  { text: 'TOTAL DUE', style: 'totalLabel' },
                  { text: `₹${order.dueAmount.toLocaleString('en-IN')}`, style: 'totalValue', alignment: 'right' }
                ]
              ]
      },
      layout: {
              hLineWidth: (i, node) => {
                return (i === 0 || i === node.table.body.length - 1) ? 1.5 : 0.5;
              },
              vLineWidth: () => 0.5,
              hLineColor: (i, node) => {
                return (i === 0 || i === node.table.body.length - 1) ? '#2c3e50' : '#bdc3c7';
              },
              vLineColor: () => '#bdc3c7',
              paddingLeft: () => 12,
              paddingRight: () => 12,
              paddingTop: () => 8,
              paddingBottom: () => 8,
              fillColor: (rowIndex, node) => {
                return rowIndex === node.table.body.length - 1 ? '#ecf0f1' : null;
              }
            }
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Payment Terms and Notes
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: 'PAYMENT TERMS',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
              },
              {
                text: [
                  '• Payment is due within 30 days of invoice date\n',
                  '• Late payments may incur additional charges\n',
                  '• Bank transfer details will be provided separately\n',
                  '• Please include invoice number in payment reference'
                ],
                style: 'termsText'
              }
            ]
          },
          {
            width: '50%',
            stack: [
              {
                text: 'NOTES',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
              },
              {
                text: studio?.invoiceFooterNote || 'Thank you for choosing our services. We appreciate your business!',
                style: 'notesText'
              }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Footer
      {
        text: [
          { text: 'For any queries, please contact us at ', style: 'footerText' },
          { text: studio?.studioEmail || 'info@studio.com', style: 'footerLink' },
          { text: ' or call ', style: 'footerText' },
          { text: studio?.studioPhone || '+91 1234567890', style: 'footerLink' }
        ],
        alignment: 'center',
        style: 'footer',
        margin: [0, 20, 0, 0]
      }
    ],
    styles: {
      companyName: {
        fontSize: 24,
        bold: true,
        color: '#2c3e50',
        margin: [0, 0, 0, 5]
      },
      companyAddress: {
        fontSize: 10,
        color: '#7f8c8d',
        margin: [0, 0, 0, 2]
      },
      companyContact: {
        fontSize: 9,
        color: '#7f8c8d',
        margin: [0, 0, 0, 2]
      },
      documentType: {
        fontSize: 18,
        bold: true,
        color: '#3498db',
        margin: [0, 0, 0, 10]
      },
      label: {
        fontSize: 9,
        color: '#7f8c8d',
        bold: true
      },
      value: {
        fontSize: 9,
        color: '#2c3e50',
        bold: true
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#2c3e50',
        margin: [0, 0, 0, 5]
      },
      customerName: {
        fontSize: 11,
        bold: true,
        color: '#2c3e50'
      },
      customerInfo: {
        fontSize: 9,
        color: '#7f8c8d'
      },
      studioName: {
        fontSize: 11,
        bold: true,
        color: '#2c3e50'
      },
      studioInfo: {
        fontSize: 9,
        color: '#7f8c8d'
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#2c3e50',
        alignment: 'center'
      },
      tableCell: {
        fontSize: 9,
        color: '#2c3e50'
      },
      summaryLabel: {
        fontSize: 9,
        color: '#7f8c8d'
      },
      summaryValue: {
        fontSize: 9,
        color: '#2c3e50',
        bold: true
      },
      totalLabel: {
        fontSize: 11,
        bold: true,
        color: '#2c3e50'
      },
      totalValue: {
        fontSize: 11,
        bold: true,
        color: '#e74c3c'
      },
      termsText: {
        fontSize: 8,
        color: '#7f8c8d',
        lineHeight: 1.3
      },
      notesText: {
        fontSize: 8,
        color: '#7f8c8d',
        lineHeight: 1.3
      },
      footerText: {
        fontSize: 8,
        color: '#7f8c8d'
      },
      footerLink: {
        fontSize: 8,
        color: '#3498db',
        bold: true
      },
      footer: {
        fontSize: 8,
        color: '#7f8c8d'
      }
    },
    defaultStyle: {
      font: "Roboto"
    }
  };

  return new Promise((resolve, reject) => {
    const chunks = [];
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.end();
  });
};
