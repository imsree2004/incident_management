import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportAgent = sequelize.define('SupportAgent', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  department: {
    type: DataTypes.STRING,
    allowNull: false
  }

});

export default SupportAgent;
