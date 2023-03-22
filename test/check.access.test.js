const { expect } = require('chai');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../secrets.env' });

const config = require('../config');
const app = require('../app');
const logger = require('../libs/logger');

if (config.node.env !== 'dev') {
  logger.warn('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

describe('/test/check.access.test.js', () => {
  let _server;

  before(async () => {
    config.jwt.check = true;
    _server = app.listen(config.server.port);
  });

  after(async () => {
    config.jwt.check = false;
    _server.close();
  });

  describe('check access', () => {
    it('access denied brands', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/brands`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 401').to.be.equal(401);
    });
    it('access denied providers', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/providers`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 401').to.be.equal(401);
    });
    it('access denied upload file', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/file/upload`, {method: 'POST'})
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 401').to.be.equal(401);
    });
    it('access is allowed', async () => {

      const token = jwt.sign(
        { user: 'user' },
        config.jwt.secretKey,
        { expiresIn: 60 },
      );

      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/brands`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
    });
  });
});

async function _getData(response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}

function _expectFieldState(data) {
  expect(data, 'сервер возвращает объект с полями id, title')
    .that.be.an('object')
    .to.have.keys(['id', 'title']);
}

function _expectErrorFieldState(data) {
  expect(data, 'сервер возвращает объект с описанием ошибки')
    .that.is.an('object')
    .to.have.property('error');
}
