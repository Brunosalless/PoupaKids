'use strict';

const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  dialectOptions: { charset: 'utf8mb4' },
  define: { freezeTableName: true, timestamps: false },
  logging: env.nodeEnv === 'development' ? (msg) => console.log(`[sql] ${msg}`) : false,
});

module.exports = sequelize;
