require('dotenv').config({ path: './secret.env' });

module.exports = {
  node: {
    env: process.env.NODE_ENV || 'dev',
  },
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3100,
  },
  postgres: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bridge',
    password: process.env.DB_PASS || 'admin',
    port: process.env.DB_PORT || 5432,
  },
  jwt: {
    check: process.env.JWT_CHECK === 'true',
    secretKey: process.env.JWT_SECRET_KEY || 'any_secret',
  },
  search: {
    // минимальный порог релевантности для фильтрации полнотекстового поиска
    minRankFullTextSearch: process.env.minRankFullTextSearch || 0.0799,
    // минимальный порог релевантности для включения липкого поиска
    minRankForStartGlueSearch: process.env.minRankForStartGlueSearch || 0.065,
    // минимальная длина поискового запроса (равна значение + 1)
    // при значении 3, минимальная длина строки запроса = 4
    minLengthGlueSearchQuery: process.env.minLengthGlueSearchQuery || 2,
  },
  log: {
    file: 'app.log',
  },
};
