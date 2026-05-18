const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Note = sequelize.define('Note', {
  text: { type: DataTypes.TEXT, allowNull: false }
}, { timestamps: true });

module.exports = Note;
