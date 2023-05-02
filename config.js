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
    minRankFullTextSearch: process.env.MIN_RANK_FULL_SEARCH || 0.0799,
    // минимальный порог релевантности для включения липкого поиска
    minRankForStartGlueSearch: process.env.MIN_RANK_FOR_START_GLUE_SEARCH || 0.065,
    // минимальная длина поискового запроса (равна значение + 1)
    // при значении 3, минимальная длина строки запроса = 4
    minLengthGlueSearchQuery: process.env.MIN_LENGTH_GLUE_SEARCH_QUERY || 4,
    // время актуальности цены и количества
    ttl: process.env.ACTUAL_TTL || '10 day',
  },
  log: {
    file: 'app.log',
  },
  api: {
    voshod: {
      key: process.env.VOSHOD_API_KEY || null,
      uri: 'https://api.v-avto.ru/v1/items',
    },
  },
};
