import User from "../models/UserSchema.js";
import Customer from "../models/customerSchema.js"
import sendEmail from "../utils/emailSender.js";
import mongoose from "mongoose";
import orderSchema from "../models/orderSchema.js";

const addCustomer = async (req, res) => {
  try {
    const { userId, name, city, email, mobile, address } = req.body;

    if (!userId || !name || !mobile) {
      return res
        .status(400)
        .json({ message: "User ID, name, and phone are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingCustomer = await Customer.findOne({ userId, mobile });
    if (existingCustomer) {
      return res.status(409).json({ message: "Customer already exists" });
    }

    const newCustomer = new Customer({
      userId,
      name,
      mobile,
      email: email || "",
      address: address || "",
      city: city || "",
    });

    await newCustomer.save();

    try {
      await sendEmail(
        user.email,
        "📥 New Customer Added",
        `Hi ${
          user.name
        },\n\nA new customer has been added to your studio:\n\nName: ${name}\nMobile: ${mobile}\nCity: ${
          city || "N/A"
        }\nEmail: ${email || "N/A"}\n\nThanks,\nCRM Team`
      );
    } catch (err) {
      console.log("❗ Email to admin failed:", err.message);
    }

    res
      .status(201)
      .json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.log("❌ Error adding customer:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Customer.aggregate(pipeline);
    const customers = result[0].data;
    const totalCount = result[0].totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      data: customers,
    });
  } catch (error) {
    console.log("❌ Aggregation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { customerId, search = "", page = 1, limit = 5 } = req.body;
    const userId = req.user._id;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const orderQuery = {
      customer: customerId,
      userId,
    };

    if (search) {
      orderQuery.venue = { $regex: search, $options: "i" };
    }

    const totalOrders = await orderSchema.countDocuments(orderQuery);

    const orders = await orderSchema
      .find(orderQuery)
      .populate("services.service")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      customer,
      orders,
      pagination: {
        totalOrders,
        page,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.log("❌ Error fetching customer by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findOneAndDelete({
      _id: customerId,
      userId,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.log("❌ Error deleting customer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { customerId, name, city, email, mobile, address } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: customerId, userId },
      { name, city, email, mobile, address },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.log("❌ Error updating customer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCustomers = async (req, res) => {
  try {
    const { customerIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: "No customer IDs provided" });
    }

    const validIds = customerIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid customer IDs provided" });
    }

    const result = await Customer.deleteMany({
      _id: { $in: validIds },
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No customers found to delete" });
    }

    res.status(200).json({
      message: `${result.deletedCount} customers deleted successfully`,
    });
  } catch (error) {
    console.log("❌ Error deleting customers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomers,
  deleteCustomer,
};
