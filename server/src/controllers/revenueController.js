import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import Service from "../models/serviceSchema.js";
import Customer from "../models/customerSchema.js";

export const getRevenueReports = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Total Revenue per Customer
    const revenuePerCustomer = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$customer",
          totalRevenue: { $sum: "$finalTotal" },
          ordersCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo"
        }
      },
      { $unwind: "$customerInfo" },
      {
        $project: {
          name: "$customerInfo.name",
          mobile: "$customerInfo.mobile",
          totalRevenue: 1,
          ordersCount: 1
        }
      }
    ]);

    // 2. Revenue per Month
    const revenuePerMonth = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$finalTotal" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    // 3. Revenue per Year
    const revenuePerYear = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          totalRevenue: { $sum: "$finalTotal" }
        }
      },
      { $sort: { "_id.year": -1 } }
    ]);

    // 4. Profit Margins
    const profitMargins = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$services" },
      {
        $lookup: {
          from: "services",
          localField: "services.service",
          foreignField: "_id",
          as: "serviceInfo"
        }
      },
      { $unwind: "$serviceInfo" },
      {
        $project: {
          orderId: "$_id",
          serviceName: "$serviceInfo.name",
          revenue: "$services.total",
          cost: {
            $multiply: ["$services.qty", "$serviceInfo.investCost"]
          },
          profit: {
            $subtract: [
              "$services.total",
              { $multiply: ["$services.qty", "$serviceInfo.investCost"] }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$serviceName",
          totalRevenue: { $sum: "$revenue" },
          totalCost: { $sum: "$cost" },
          totalProfit: { $sum: "$profit" }
        }
      }
    ]);

    // 5. Service-wise Breakdown
    const serviceBreakdown = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$services" },
      {
        $group: {
          _id: "$services.service",
          totalRevenue: { $sum: "$services.total" },
          totalQty: { $sum: "$services.qty" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceInfo"
        }
      },
      { $unwind: "$serviceInfo" },
      {
        $project: {
          name: "$serviceInfo.name",
          group: "$serviceInfo.group",
          totalRevenue: 1,
          totalQty: 1,
          totalOrders: 1
        }
      }
    ]);

    // 6. Per Order Revenue
    const perOrderRevenue = await Order.find({ userId })
      .select("invoiceNumber finalTotal discount tax advanceAmount dueAmount createdAt")
      .sort({ createdAt: -1 });

    // 7. New Customers per Month
    const newCustomersPerMonth = await Customer.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    // 8. Total Orders
    const totalOrders = await Order.countDocuments({ userId });
    // 9. Total Revenue
    const totalRevenue = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$finalTotal" } } }
    ]);
    // 10. Total Services
    const totalServices = await Service.countDocuments({ userId });

    // 📦 Return all results
    res.json({
      revenuePerCustomer,
      revenuePerMonth,
      revenuePerYear,
      profitMargins,
      serviceBreakdown,
      perOrderRevenue,
      newCustomersPerMonth,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalServices
    });

  } catch (error) {
    console.log("❌ Revenue report error:", error);
    res.status(500).json({ message: "Failed to generate reports", error: error.message });
  }
};

// Dashboard analytics endpoint
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Total revenue (sum of finalTotal for all orders)
    const orders = await Order.find({ userId });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const orderCount = orders.length;
    const customerCount = await Customer.countDocuments({ userId });
    // Order status breakdown
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    res.status(200).json({
      totalRevenue,
      orderCount,
      customerCount,
      statusCounts
    });
  } catch (error) {
    console.log('❌ Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Dashboard stats error', error: error.message });
  }
};

export { getDashboardStats };
