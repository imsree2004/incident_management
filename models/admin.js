// models/admin.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }, // hashed
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'admin' }
}, {
  timestamps: true
});

export default Admin;
