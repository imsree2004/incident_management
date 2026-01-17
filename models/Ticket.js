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
      type: DataTypes.TEXT,
      allowNull: true
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "OPEN",
      validate: {
        isIn: [["OPEN", "IN_PROGRESS", "RESOLVED"]]
      }
    },

    severity: {
      type: DataTypes.STRING,
      allowNull: true
    },

    department: {
      type: DataTypes.STRING,
      allowNull: true
    },

    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    assigned_to: {
      type: DataTypes.STRING,
      allowNull: true
    }
});

export default Ticket;
