import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Complaint = sequelize.define('Complaint', {
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachments: {
    type: DataTypes.JSON, // store list of attachments
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'New', // New, Processed, or Resolved
  },
  severity: {
    type: DataTypes.STRING,
    defaultValue: 'Pending', // Low / Medium / High — to be predicted later
  },
});

export default Complaint;
