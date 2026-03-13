const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  from_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'processed'
  }
});

module.exports = EmailLog;