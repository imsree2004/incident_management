import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  username: { type: DataTypes.STRING, allowNull: false, unique: true },

  email: { type: DataTypes.STRING, allowNull: false, unique: true },

  password: { type: DataTypes.STRING, allowNull: false },

  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "agent" // or admin
  },

  department: {
    type: DataTypes.STRING
  },
  current_load: {
  type: DataTypes.INTEGER,
  defaultValue: 0
}
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export default User;