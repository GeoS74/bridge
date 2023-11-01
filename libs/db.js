const { Pool } = require('pg');

const config = require('../config');
const logger = require('./logger');

const pool = new Pool({
  user: config.postgres.user,
  host: config.postgres.host,
  database: config.postgres.database,
  password: config.postgres.password,
  port: config.postgres.port,

  // idleTimeoutMillis - количество миллисекунд,
  // в течение которых клиент должен бездействовать в пуле и не быть проверенным
  // прежде чем он будет отключен от бэкенда и удален
  // по умолчанию 10000 (10 секунд) — установите 0,
  // чтобы отключить автоотключение неработающих клиентов
  idleTimeoutMillis: 10000,

  // connectionTimeoutMillis - количество миллисекунд ожидания
  // до истечения времени ожидания при подключении нового клиента
  // по умолчанию это 0, что означает отсутствие тайм-аута
  connectionTimeoutMillis: 10000,

  // max - максимальное количество клиентов,
  // которое должно содержаться в пуле
  // по умолчанию установлено значение 10.
  max: 50,
});

pool.on('error', error => {
  logger.error(`pool db error: ${error.message}`)
});

// module.exports.query = (text, params) => pool.query(text, params);
module.exports.query = async (text, params) => {
  const client = await this.pool.connect();
  const result = await client.query(text, params);
  client.release();
  return result;
};

module.exports.pool = pool;
