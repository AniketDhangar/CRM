import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  entityType: {
    type: String, // e.g., 'Order', 'Customer', 'User'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AuditLog", AuditLogSchema); 