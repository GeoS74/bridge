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
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      title TEXT
    );
  `)
    .then(() => logger.info('create table "brands"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE providers (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      title TEXT
    );
  `)
    .then(() => logger.info('create table "providers"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE bovid (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      uid UUID UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      article TEXT,
      article_parse TEXT,
      title TEXT,
      amount REAL DEFAULT 0,
      storage JSON,
      weight REAL DEFAULT 0,
      width REAL DEFAULT 0,
      height REAL DEFAULT 0,
      length REAL DEFAULT 0,
      manufacturer TEXT
    );
  `)
    .then(() => logger.info('create table "bovid"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE positions (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      brand_id INTEGER NOT NULL REFERENCES brands ON DELETE CASCADE,
      provider_id INTEGER NOT NULL REFERENCES providers ON DELETE CASCADE,
      bovid_id INTEGER REFERENCES bovid,
      article TEXT,
      title TEXT,
      full_title_parse TEXT NOT NULL,
      amount REAL DEFAULT 0
    );
  `)
    .then(() => logger.info('create table "positions"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE TABLE prices (
      id BIGSERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      position_id INTEGER NOT NULL REFERENCES positions ON DELETE CASCADE,
      price REAL NOT NULL
    );
  `)
    .then(() => logger.info('create table "prices"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE INDEX bovid_idx ON bovid (article_parse);
    CREATE INDEX positions_idx ON positions (full_title_parse, brand_id, provider_id);
    CREATE INDEX prices_idx ON prices (position_id);
  `)
    .then(() => logger.info('create indexes'))
    .catch((error) => logger.warn(error.message));

  logger.info('database init complete');
  process.exit();
})();
