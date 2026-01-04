module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define("Ticket", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    email_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },

    raw_email: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED"),
      defaultValue: "OPEN"
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

  return Ticket;
};
