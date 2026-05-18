require('dotenv').config();
const mysql = require('mysql2/promise');
(async ()=>{
  try{
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'mini_crm'}\`;`);
    console.log('Database ensured');
    await conn.end();
  }catch(err){
    console.error('Create DB error', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
