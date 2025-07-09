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

  const docDefinition = {
    content: [
      { text: studio?.studioName || "Studio Name", style: "header" },
      { text: studio?.studioLocation || "-", margin: [0, 0, 0, 10] },

      {
        columns: [
          {
            text: [
              { text: `${type.toUpperCase()} #: `, bold: true },
              order.invoiceNumber,
              "\n",
              { text: "Date: ", bold: true },
              new Date(order.createdAt).toLocaleDateString(),
            ],
          },
          {
            text: [
              { text: "BILL TO:\n", bold: true },
              customer.name || "Customer",
              "\n",
              customer.mobile || "-",
              "\n",
              customer.city || "-",
            ],
            alignment: "right",
          },
        ],
        margin: [0, 10, 0, 10],
      },

      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Service", bold: true },
              { text: "Qty", bold: true },
              { text: "Days", bold: true },
              { text: "Rate", bold: true },
              { text: "Total", bold: true },
            ],
            ...order.services.map((item) => [
              item.service?.name || "Unnamed",
              item.qty,
              item.days,
              `₹${item.salePrice}`,
              `₹${item.total}`,
            ]),
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => "#000",
          vLineColor: () => "#000",
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },

    //   {
    //     alignment: "left",
    //     margin: [0, 10, 0, 20],
    //     paddingLeft: [10],
    //     table: {
    //       body: [
    //         ["Subtotal", `₹${order.finalTotal + order.discount - order.tax}`],
    //         ["Tax", `₹${order.tax}`],
    //         ["Discount", `₹${order.discount}`],
    //         ["Advance Paid", `₹${order.advanceAmount}`],
    //         [
    //           { text: "Due Amount", bold: true },
    //           { text: `₹${order.dueAmount}`, bold: true },
    //         ],
    //       ],
    //     },
    //     layout:  {
    //       hLineWidth: () => 1,
    //       vLineWidth: () => 2,
    //       hLineColor: () => "#000",
    //       vLineColor: () => "#000",
    //       paddingLeft: () => 7,
    //       paddingRight: () => 7,
    //       paddingTop: () => 5,
    //       paddingBottom: () => 5,
    //     },
    //   },

{
  columns: [
    { width: '*', text: '' },
    {
      width: '80%',
      table: {
        body: [
          ["Subtotal", `₹${order.finalTotal + order.discount - order.tax}`],
          ["Tax", `₹${order.tax}`],
          ["Discount", `₹${order.discount}`],
          ["Advance Paid", `₹${order.advanceAmount}`],
          [
            { text: "Due Amount", bold: true },
            { text: `₹${order.dueAmount}`, bold: true },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => "#000",
        vLineColor: () => "#000",
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
    }
  ],
  margin: [0, 10, 0, 20],
}
,

      {
        text: studio.invoiceFooterNote || "Thank you for your business!",
        style: "footer",
      },
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      footer: { margin: [0, 0, 0, 0], alignment: "left", italics: true },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  return new Promise((resolve, reject) => {
    const chunks = [];
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.end();
  });
};
