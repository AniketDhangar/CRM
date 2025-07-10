import Order from "../models/orderSchema.js";
import Customer from "../models/customerSchema.js";
import mongoose from "mongoose";
import auditLogger from '../utils/auditLogger.js';

// Optional: Auto-generate invoice number
const generateInvoiceNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `INV-${random}-${timestamp}`;
};

// Create a new order (admin can only create for their own customers)
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

    // Validate customer ID and ownership
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }
    // Only allow if customer belongs to this admin
    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found or unauthorized" });
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

    // Create the order (always assign to logged-in admin)
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

    await auditLogger({
      userId,
      action: 'Order Created',
      entityType: 'Order',
      entityId: newOrder._id,
      details: `Order created for customer ${customer.name} (${customer._id})`,
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

// Get a single order by ID (admin can only see their own orders)
const getOrderById = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Only fetch if order belongs to this admin
    const order = await Order.findOne({ _id, userId })
      .populate("customer", "-createdAt -updatedAt -__v")
      .populate("services.service", "name group sellCost");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      snapshot: order.customerSnapshot,
      currentCustomer: order.customer,
      services: order.services,
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

// Get all orders for the logged-in admin
const getAllOrders = async (req, res) => {
  try {
    // Get the admin's userId from the JWT
    const userId = req.user._id;
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Optional search and status filter
    const search = req.query.search || "";
    const status = req.query.status || null;

    // Build the query object
    const query = { userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch orders from the database
    // Populate the customer field for reference (not used in frontend, but good for future)
    // Also populate services.service with the service name
    // Sort by creation date (newest first)
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name mobile email city address")
      .populate("services.service", "name")
      .lean();

    // Get total count for pagination
    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Map orders to include all fields needed by the frontend
    const mappedOrders = orders.map(order => {
      // Recalculate financials if missing (for legacy orders)
      let finalTotal = order.finalTotal;
      let dueAmount = order.dueAmount;
      let advanceAmount = order.advanceAmount;
      // Only recalculate if any are missing or not a number
      if (typeof finalTotal !== 'number' || typeof dueAmount !== 'number' || typeof advanceAmount !== 'number') {
        const subtotal = Array.isArray(order.services)
          ? order.services.reduce((sum, item) => sum + (item.total || 0), 0)
          : 0;
        const taxAmount = subtotal * (Number(order.tax) / 100);
        finalTotal = subtotal + taxAmount - Number(order.discount || 0);
        advanceAmount = Number(order.advanceAmount || 0);
        dueAmount = finalTotal - advanceAmount;
      }
      return {
        id: order._id || order.id || order.invoiceNumber,
        invoiceNumber: order.invoiceNumber || 'N/A',
        client: order.customerSnapshot?.name || order.customer?.name || 'N/A',
        clientMobile: order.customerSnapshot?.mobile || order.customer?.mobile || 'N/A',
        eventDate: order.eventDate ? new Date(order.eventDate).toLocaleDateString() : 'N/A',
        venue: order.venue || 'N/A',
        services: Array.isArray(order.services) ? order.services.length : 0,
        tax: order.tax ?? 0,
        discount: order.discount ?? 0,
        finalTotal,
        advanceAmount,
        dueAmount,
        status: order.status || 'pending',
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A',
        servicesRaw: order.services // for frontend serviceNames extraction
      };
    });

    // Return the result
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalCount,
      orders: mappedOrders,
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

// Update an order (admin can only update their own orders)
const updateOrder = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;
    // Only update if order belongs to this admin
    const order = await Order.findOne({ _id, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // Only update fields present in req.body
    const updatableFields = [
      "eventDate", "venue", "services", "tax", "discount", "advanceAmount", "status"
    ];
    let recalcTotals = false;
    updatableFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        order[field] = req.body[field];
        if (["services", "tax", "discount", "advanceAmount"].includes(field)) {
          recalcTotals = true;
        }
      }
    });

    // Recalculate totals if relevant fields changed
    if (recalcTotals) {
      const services = order.services || [];
      const subtotal = Array.isArray(services)
        ? services.reduce((sum, item) => sum + (item.total || 0), 0)
        : 0;
      const taxAmount = subtotal * (Number(order.tax) / 100);
      const finalTotal = subtotal + taxAmount - Number(order.discount || 0);
      const dueAmount = finalTotal - Number(order.advanceAmount || 0);
      order.finalTotal = finalTotal;
      order.dueAmount = dueAmount;
    }

    order.history.push({
      action: `Order updated`,
      by: userId,
      date: new Date(),
    });
    await order.save();

    await auditLogger({
      userId,
      action: 'Order Updated',
      entityType: 'Order',
      entityId: order._id,
      details: `Order updated. Status: ${order.status}`,
    });

    res.status(200).json({
      success: true,
      message: "Order updated (partial update supported)",
      order,
    });
  } catch (error) {
    console.log("❌ Error updating order:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an order (admin can only delete their own orders)
const deleteOrder = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Only delete if order belongs to this admin
    const deletedOrder = await Order.findOneAndDelete({ _id, userId });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    await auditLogger({
      userId,
      action: 'Order Deleted',
      entityType: 'Order',
      entityId: deletedOrder._id,
      details: `Order deleted. Invoice: ${deletedOrder.invoiceNumber}`,
    });

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

// Bulk update order status
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    const userId = req.user._id;
    if (!Array.isArray(orderIds) || !status) {
      return res.status(400).json({ message: 'orderIds (array) and status are required' });
    }
    const result = await Order.updateMany(
      { _id: { $in: orderIds }, userId },
      { $set: { status } }
    );
    // Audit log for each order
    for (const orderId of orderIds) {
      await auditLogger({
        userId,
        action: 'Order Bulk Status Update',
        entityType: 'Order',
        entityId: orderId,
        details: `Order status set to ${status} (bulk)`
      });
    }
    res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.log('❌ Bulk update error:', error.message);
    res.status(500).json({ message: 'Bulk update error', error: error.message });
  }
};

export { addOrder, getOrderById, getAllOrders, updateOrder, deleteOrder, bulkUpdateOrderStatus };
