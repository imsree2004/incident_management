const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminAuditLog = sequelize.define('AdminAuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_id'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  previousValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'previous_value'
  },
  newValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'new_value'
  },
  performedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'performed_by'
  },
  performedByUsername: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'performed_by_username'
  }
}, {
  tableName: 'admin_audit_logs',
  timestamps: true,
  updatedAt: false
});

module.exports = AdminAuditLog;