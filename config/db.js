import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === "docker" ? ".env.docker" : ".env.local"
});

const isDocker = process.env.NODE_ENV === "docker";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,

    dialectOptions: isDocker
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },

    define: {
      schema: 'public'
    }
  }
);

// force schema
await sequelize.query('SET search_path TO public;');
export default sequelize;