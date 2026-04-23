'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'BancoKids',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  dialect: 'mysql',
  dialectOptions: { charset: 'utf8mb4' },
  define: { underscored: false, freezeTableName: true, timestamps: false },
  logging: false,
};

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: { ...base, logging: false },
};
