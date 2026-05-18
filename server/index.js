const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Models (to ensure associations are set up)
const User = require('./models/User');
const Lead = require('./models/Lead');
const Note = require('./models/Note');

// Associations
Lead.hasMany(Note);
Note.belongsTo(Lead);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));

const PORT = process.env.PORT || 5000;

const start = async () => {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		console.log('Database connected and synced');
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (err) {
		console.error('Unable to start server:', err.message);
		process.exit(1);
	}
};

start();
