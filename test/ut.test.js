const { expect } = require('chai');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../secrets.env' });

const config = require('../config');
const app = require('../app');
const db = require('../libs/db');
const logger = require('../libs/logger');

if (process.env.NODE_ENV !== 'develop') {
  logger.warn('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

describe('/test/ut.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await db.query('DELETE FROM prices');
    await db.query('DELETE FROM positions');
    _server.close();
  });

  describe('sync 1C', () => {
    it('receiving data from 1C', async () => {
      const positions = {
        json_data: JSON.stringify({})
      };
      const optional = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(positions),
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      // _expectFieldState.call(this, response.data);
    });
  });
});

async function _getData(response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}