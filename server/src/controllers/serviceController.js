import mongoose from "mongoose";
import Service from "../models/serviceSchema.js";
import Order from "../models/orderSchema.js";

const addService = async (req, res) => {
  try {
    const { name, investCost, sellCost } = req.body;
    const userId = req.user._id;

    if (!name || sellCost === undefined) {
      return res.status(400).json({ message: "Name and sellCost are required." });
    }

    const finalInvestCost = investCost || 0;
    const existingService = await Service.findOne({ name, userId });
    if (existingService) {
      return res.status(400).json({ message: "Service already exists" });
    }

    const newService = await Service.create({
      investCost: finalInvestCost,
      ...req.body,
      userId
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      service: newService,
    });
  } catch (error) {
    console.error("❌ Error adding service:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const allServices = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const match = { userId: new mongoose.Types.ObjectId(userId) };

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { group: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "orders",
          let: { serviceId: "$_id" },
          pipeline: [
            { $unwind: "$services" },
            {
              $match: {
                $expr: { $eq: ["$services.service", "$$serviceId"] },
              },
            },
            {
              $lookup: {
                from: "customers",
                localField: "customer",
                foreignField: "_id",
                as: "customerInfo",
              },
            },
            {
              $project: {
                customer: { $arrayElemAt: ["$customerInfo", 0] },
                total: "$services.total",
              },
            },
          ],
          as: "usage",
        },
      },
      {
        $addFields: {
          usedCount: { $size: "$usage" },
          customers: "$usage.customer",
          totalRevenue: { $sum: "$usage.total" },
        },
      },
      {
        $project: {
          name: 1,
          group: 1,
          sellCost: 1,
          investCost: 1,
          status: 1,
          usedCount: 1,
          totalRevenue: 1,
          customers: {
            _id: 1,
            name: 1,
            email: 1,
            mobile: 1,
            city: 1,
          },
        },
      },
    ];

    const [services, totalCount] = await Promise.all([
      Service.aggregate(pipeline),
      Service.countDocuments(match),
    ]);

    return res.status(200).json({
      message: "All services fetched with usage",
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      data: services,
    });
  } catch (error) {
    console.log("❌ error in fetching all services:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching services",
      error: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findOne({ _id, userId });
    if (!service) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    const usage = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$services" },
      { $match: { "services.service": new mongoose.Types.ObjectId(_id) } },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $project: {
          total: "$services.total",
          customer: { $arrayElemAt: ["$customerInfo", 0] },
        },
      },
    ]);

    const usedCount = usage.length;
    const totalRevenue = usage.reduce((sum, item) => sum + item.total, 0);
    const customers = usage.map((item) => item.customer);

    res.status(200).json({
      success: true,
      message: "Service fetched successfully",
      service,
      usage: {
        usedCount,
        totalRevenue,
        customers,
      },
    });
  } catch (error) {
    console.log("❌ Error fetching service by ID:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching service",
      error: error.message,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { _id, name, group, investCost, sellCost, taxRate, status } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findOne({ _id, userId });
    if (!service) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    if (name) service.name = name;
    if (group) service.group = group;
    if (investCost !== undefined) service.investCost = investCost;
    if (sellCost !== undefined) service.sellCost = sellCost;
    if (taxRate !== undefined) service.taxRate = taxRate;
    if (status) service.status = status;

    const updatedService = await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.log("❌ Error updating service:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating service",
      error: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const deleted = await Service.findOneAndDelete({ _id, userId });

    if (!deleted) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      deletedServiceId: deleted._id,
      name: deleted.name,
    });
  } catch (error) {
    console.log("❌ Error deleting service:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting service",
      error: error.message,
    });
  }
};

export {
  addService,
  allServices,
  getServiceById,
  updateService,
  deleteService
};
