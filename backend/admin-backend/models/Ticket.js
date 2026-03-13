const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticket_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
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
  priority: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assigned_to: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open'
  }
});

module.exports = Ticket;