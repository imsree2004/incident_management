// config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Sequelize instance using env vars.
 * Make sure your .env contains DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_DIALECT
 */

const sequelize = new Sequelize(
  process.env.DB_NAME || 'database_development',
  process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
  process.env.DB_PASS || process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false
  }
);

export default sequelize;
