import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  ticket_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  email_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },

  summary: {
    type: DataTypes.TEXT
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "OPEN"
  },

  severity: {
    type: DataTypes.STRING
  },

  department: {
    type: DataTypes.STRING
  },

  confidence: {
    type: DataTypes.FLOAT
  },

  assigned_to: {
  type: DataTypes.INTEGER,
  allowNull: true
}

});

export default Ticket;