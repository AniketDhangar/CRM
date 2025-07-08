import Order from "../models/orderSchema.js";
import Customer from "../models/customerSchema.js";
import mongoose from "mongoose";

// Optional: Auto-generate invoice number
const generateInvoiceNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `INV-${random}-${timestamp}`;
};

// const addOrder = async (req, res) => {
//   try {
//     const {
//       customerId,
//       eventDate,
//       venue,
//       services,
//       tax = 0,
//       discount = 0,
//       finalTotal,
//       advanceAmount = 0,
//       dueAmount,
//     } = req.body;

//     const userId = req.user._id;

//     if (!mongoose.Types.ObjectId.isValid(customerId)) {
//       return res.status(400).json({ message: "Invalid customer ID" });
//     }

//     const customer = await Customer.findOne({ _id: customerId, userId });

//     if (!customer) {
//       return res
//         .status(404)
//         .json({ message: "Customer not found or unauthorized" });
//     }

//     const customerSnapshot = {
//       name: customer.name,
//       email: customer.email,
//       mobile: customer.mobile,
//       address: customer.address,
//       city: customer.city,
//     };

//     const invoiceNumber = generateInvoiceNumber();

//     const newOrder = await Order.create({
//       customer: customer._id,
//       customerSnapshot,
//       userId,
//       invoiceNumber,
//       eventDate,
//       venue,
//       services,
//       tax,
//       discount,
//       finalTotal,
//       advanceAmount,
//       dueAmount,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order: newOrder,
//     });
//   } catch (error) {
//     console.log("❌ Error adding order:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

const addOrder = async (req, res) => {
  try {
    const {
      customerId,
      eventDate,
      venue,
      services,
      tax = 0,
      discount = 0,
      advanceAmount = 0,
    } = req.body;

    const userId = req.user._id;

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Find the customer owned by this user
    const customer = await Customer.findOne({ _id: customerId, userId });

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found or unauthorized" });
    }

    // Prepare snapshot
    const customerSnapshot = {
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      address: customer.address,
      city: customer.city,
    };

    // Calculate financials
    const subtotal = Array.isArray(services)
      ? services.reduce((sum, item) => sum + item.total, 0)
      : 0;

    const taxAmount = subtotal * (tax / 100);
    const finalTotal = subtotal + taxAmount - discount;
    const dueAmount = finalTotal - advanceAmount;

    const invoiceNumber = generateInvoiceNumber();

    // Create the order
    const newOrder = await Order.create({
      customer: customer._id,
      customerSnapshot,
      userId,
      invoiceNumber,
      eventDate,
      venue,
      services,
      tax,
      discount,
      advanceAmount,
      finalTotal,
      dueAmount,
      history: [
        {
          action: "Order created",
          by: userId,
          date: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log("❌ Error adding order:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id, userId })
      .populate("customer", "-createdAt -updatedAt -__v")
      .populate("services.service", "name group sellCost");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      snapshot: order.customerSnapshot, // 🔒 customer data at time of order
      currentCustomer: order.customer, // 🧾 up-to-date customer info
      services: order.services, // 🛠 service details
      order: {
        _id: order._id,
        invoiceNumber: order.invoiceNumber,
        eventDate: order.eventDate,
        venue: order.venue,
        tax: order.tax,
        discount: order.discount,
        finalTotal: order.finalTotal,
        advanceAmount: order.advanceAmount,
        dueAmount: order.dueAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.log("❌ Error fetching order:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const status = req.query.status || null;

    const match = { userId };

    if (status) {
      match.status = status;
    }

    if (search) {
      match.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: match },
      { $sort: { [sortBy]: sortOrder } },
      {
        $facet: {
          orders: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    const orders = result[0].orders;
    const totalCount = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalCount,
      orders,
    });
  } catch (error) {
    console.log("❌ Error fetching orders:", error.message);
    res.status(500).json({
      success: false,
      message: "❌ Error fetching orders",
      error: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;
    const {
      eventDate,
      venue,
      services,
      tax = 0,
      discount = 0,
      advanceAmount = 0,
      status,
    } = req.body;

    const subtotal = Array.isArray(services)
      ? services.reduce((sum, item) => sum + item.total, 0)
      : 0;
    const taxAmount = subtotal * (tax / 100);
    const finalTotal = subtotal + taxAmount - discount;
    const dueAmount = finalTotal - advanceAmount;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id, userId },
      {
        eventDate,
        venue,
        services,
        tax,
        discount,
        advanceAmount,
        finalTotal,
        dueAmount,
        status,
        $push: {
          history: {
            action: `Order updated`,
            by: userId,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order updated with recalculated totals",
      order: updatedOrder,
    });
  } catch (error) {
    console.log("❌ Error updating order:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const deletedOrder = await Order.findOneAndDelete({ _id, userId });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      orderId: deletedOrder._id,
      invoiceNumber: deletedOrder.invoiceNumber,
    });
  } catch (error) {
    console.log("❌ Error deleting order:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during delete",
      error: error.message,
    });
  }
};


export { addOrder, getOrderById, getAllOrders, updateOrder ,deleteOrder};
