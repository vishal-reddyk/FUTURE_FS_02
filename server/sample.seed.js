// Run this once to create an admin user and sample leads (node sample.seed.js)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lead = require('./models/Lead');
require('dotenv').config();

const run = async ()=>{
  await mongoose.connect(process.env.MONGO_URI);
  const pw = await bcrypt.hash('password', 10);
  await User.create({ username: 'admin', email: 'admin@demo.com', password: pw });
  await Lead.create({ name: 'Acme Corp', email: 'contact@acme.com', phone: '1234567890', company: 'Acme', source: 'Website', status: 'New' });
  console.log('Seeded');
  process.exit(0);
};
run();
