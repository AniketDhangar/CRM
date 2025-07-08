import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerSnapshot: {
      name: String,
      email: String,
      mobile: String,
      address: String,
      city: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    eventDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    venue: {
      type: String,
      trim: true,
    },

    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        days: {
          type: Number,
          required: true,
        },
        salePrice: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    finalTotal: {
      type: Number,
      required: true,
    },

    advanceAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },

    history: [
      {
        action: String,
        date: {
          type: Date,
          default: Date.now,
        },
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
