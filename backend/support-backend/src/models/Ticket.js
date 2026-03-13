import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ticket = sequelize.define('Ticket', {
  summary: DataTypes.TEXT,
  severity: DataTypes.STRING,
  category: DataTypes.STRING,
  confidence: DataTypes.FLOAT,
  status: DataTypes.STRING,
  originalEmail: DataTypes.TEXT,
  draftReply: DataTypes.TEXT,
  aiInsights: DataTypes.JSONB
});

export default Ticket;
