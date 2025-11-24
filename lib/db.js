const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123',
      database: process.env.DB_NAME || 'personal_finance_tracker',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

module.exports = getPool;

