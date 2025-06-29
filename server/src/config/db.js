

import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER ,
  process.env.DB_PASSWORD ,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    pool: {
      max: 10,
      min: 2,
      acquire: 20000,
      idle: 5000,
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    retry: { max: 3 },
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
            connectTimeout: 10000,
          }
        : {},
  }
);

export default sequelize;
