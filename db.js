const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // ou o usuário que você definiu
  host: 'localhost',
  database: 'appelectron',
  password: 'julio', // senha do PostgreSQL
  port: 5432,
});

module.exports = pool;
