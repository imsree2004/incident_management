const { AdminAuditLog } = require('../models');

const recordAdminAction = async ({
  admin,
  action,
  entityType,
  entityId,
  description,
  previousValue,
  newValue
}) => AdminAuditLog.create({
  action,
  entityType,
  entityId,
  description,
  previousValue,
  newValue,
  performedBy: admin.id,
  performedByUsername: admin.username
});

module.exports = {
  recordAdminAction
};