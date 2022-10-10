require('dotenv').config({ path: './secret.env' });

module.exports = {
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3100,
    domain: process.env.SERVER_DOMAIN || 'localhost:3100',
  },
  postgres: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bridge',
    password: process.env.DB_PASS || 'admin',
    port: process.env.DB_PORT || 5432,
  },
  log: {
    file: 'app.log',
  },
};
