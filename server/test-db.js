require('dotenv').config();
const sequelize = require('./config/db');
console.log('DB_NAME', process.env.DB_NAME);
console.log('DB_USER', process.env.DB_USER);
console.log('DB_PASS', process.env.DB_PASS ? '[SET]' : '[NOT SET]');
(async ()=>{
  try{
    await sequelize.authenticate();
    console.log('OK connected');
  }catch(err){
    console.error('AUTH ERROR', err.message);
  }
  process.exit(0);
})();
