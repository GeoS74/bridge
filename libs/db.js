const { Pool } = require('pg');

const config = require('../config');

const pool = new Pool({
  user: config.postgres.user,
  host: config.postgres.host,
  database: config.postgres.database,
  password: config.postgres.password,
  port: config.postgres.port,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
  max: 100,
});

module.exports.query = (text, params) => pool.query(text, params);
