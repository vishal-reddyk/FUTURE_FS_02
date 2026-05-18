// Run this once to create an admin user and sample leads (node sample.seed.js)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Note = require('./models/Note');

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    const pw = await bcrypt.hash('password', 10);
    await User.create({ username: 'admin', email: 'admin@demo.com', password: pw });
    const lead = await Lead.create({ name: 'Acme Corp', email: 'contact@acme.com', phone: '1234567890', company: 'Acme', source: 'Website', status: 'New' });
    await Note.create({ text: 'Initial contact logged', LeadId: lead.id });
    console.log('Seeded');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err.message);
    process.exit(1);
  }
};

run();
