const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  source: String,
  status: { type: String, enum: ['New','Contacted','Follow-Up','Converted','Closed'], default: 'New' },
  notes: [noteSchema]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
