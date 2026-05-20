const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'mini_crm';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_SSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  dialectOptions: DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  logging: false
});

module.exports = sequelize;
