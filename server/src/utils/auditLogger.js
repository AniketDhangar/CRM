import AuditLog from '../models/AuditLog.js';

/**
 * Log an audit action
 * @param {Object} params
 * @param {string|ObjectId} params.userId
 * @param {string} params.action
 * @param {string} [params.details]
 * @param {string} [params.entityType]
 * @param {string|ObjectId} [params.entityId]
 */
export default async function auditLogger({ userId, action, details, entityType, entityId }) {
  try {
    await AuditLog.create({ userId, action, details, entityType, entityId });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
} 