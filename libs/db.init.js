const { Pool } = require('pg');

const config = require('../config');
const logger = require('./logger');

const data = {
  user: config.postgres.user,
  host: config.postgres.host,
  database: '',
  password: config.postgres.password,
  port: config.postgres.port,
};

(async () => {
  let pool = new Pool(data);

  // dropped database
  if (process.argv[2] === '--drop') {
    await pool.query(`DROP DATABASE ${config.postgres.database}`)
      .then(() => logger.info(`database "${config.postgres.database}" dropped`))
      .catch((error) => logger.warn(error.message))
      .finally(() => process.exit());
  }

  // created database
  await pool.query(`CREATE DATABASE ${config.postgres.database}`)
    .then(() => logger.info(`create database "${config.postgres.database}"`))
    .catch((error) => logger.warn(error.message));

  // connect new database
  data.database = config.postgres.database;
  pool = new Pool(data);

  // created tables
  await pool.query(`
    CREATE TABLE brands (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP DEFAULT NOW(),
      updatedat TIMESTAMP DEFAULT NOW(),
      title TEXT
    );
  `)
    .then(() => logger.info('create table "brands"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE suppliers (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP DEFAULT NOW(),
      updatedat TIMESTAMP DEFAULT NOW(),
      title TEXT
    );
  `)
    .then(() => logger.info('create table "suppliers"'))
    .catch((error) => logger.warn(error.message));

  // await pool.query(`
  //   CREATE TABLE bovid (
  //     id SERIAL PRIMARY KEY,
  //     createdat TIMESTAMP DEFAULT NOW(),
  //     updatedat TIMESTAMP DEFAULT NOW(),
  //     title TEXT
  //   );
  // `)
  //   .then(() => logger.info('create table "suppliers"'))
  //   .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE positions (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP DEFAULT NOW(),
      updatedat TIMESTAMP DEFAULT NOW(),
      brand_id INTEGER REFERENCES brands,
      supplier_id INTEGER REFERENCES suppliers,
      article TEXT,
      title TEXT,
    );
  `)
    .then(() => logger.info('create table "positions"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE prices (
      id BIGSERIAL PRIMARY KEY,
      createdat TIMESTAMP DEFAULT NOW(),
      position_id INTEGER REFERENCES positions,
      price REAL
    );
  `)
    .then(() => logger.info('create table "prices"'))
    .catch((error) => logger.warn(error.message));

  logger.info('database init complete');
  process.exit();
})();
