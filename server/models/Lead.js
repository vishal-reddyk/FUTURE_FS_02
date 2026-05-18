const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lead = sequelize.define('Lead', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: DataTypes.STRING,
  company: DataTypes.STRING,
  source: DataTypes.STRING,
  status: { type: DataTypes.ENUM('New','Contacted','Follow-Up','Converted','Closed'), defaultValue: 'New' }
}, { timestamps: true });

module.exports = Lead;
