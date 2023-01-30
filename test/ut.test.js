const { expect } = require('chai');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../secrets.env' });

const config = require('../config');
const app = require('../app');
const db = require('../libs/db');
const logger = require('../libs/logger');

if (config.node.env !== 'dev') {
  logger.warn('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

describe('/test/ut.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await db.query('DELETE FROM bovid');
    _server.close();
  });

  // structure by 1C
  const position = {
    id: uuidv4(),
    code: '123456',
    article: '4320ЯX-1201010-01',
    name: 'Глушитель',
    weight: '10',
    width: '0.3',
    height: '0.5',
    length: '0.7',
    manufacturer: 'Урал',
    storage: [],
  };

  describe('receiving data from 1C', () => {
    it('insert and update positions', async () => {
      let positions = { json_data: JSON.stringify([position]) };
      const optional = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(positions),
      };

      // use function _insertPositionBovid
      let response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);

      let testPosition = await _getPositionByUID(position.id);

      position.name = 'test';
      positions = { json_data: JSON.stringify([position]) };
      optional.body = JSON.stringify(positions);

      // use function _updatePositionBovidByUID
      response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);

      testPosition = await _getPositionByID(testPosition.id);
      expect(position.name, 'сервер изменил title').to.be.equal(testPosition.title);

      position.name = 'test1';
      position.id = null;
      positions = { json_data: JSON.stringify([position]) };
      optional.body = JSON.stringify(positions);

      // use function _updatePositionBovidByCode
      response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);

      testPosition = await _getPositionByID(testPosition.id);
      expect(testPosition.title, 'сервер изменил title').to.be.equal(position.name);
    });

    it('data error handling', async () => {
      const optional = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: null,
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      let positions = { json_data: null };
      optional.body = JSON.stringify(positions);

      response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      positions = { json_data: {} };
      optional.body = JSON.stringify(positions);

      response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      positions = { json_data: JSON.stringify({}) };
      optional.body = JSON.stringify(positions);

      response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      position.id = uuidv4();
      position.code = '654321';
      position.storage = [{ amount: 1 }, { amount: -5 }, { amount: 4 }];

      positions = { json_data: JSON.stringify([position]) };
      optional.body = JSON.stringify(positions);

      response = await fetch(`http://localhost:${config.server.port}/api/ut/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);

      const testPosition = await _getPositionByUID(position.id);
      expect(testPosition.amount, 'сервер правильно обрабатывает отрицательные остатки')
        .to.be.equal(5);
    });
  });
});

async function _getPositionByID(id) {
  return db.query('SELECT * FROM bovid WHERE id=$1', [id])
    .then((res) => res.rows[0]);
}

async function _getPositionByUID(uid) {
  return db.query('SELECT * FROM bovid WHERE uid=$1', [uid])
    .then((res) => res.rows[0]);
}

async function _getData(response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}

function _expectErrorFieldState(data) {
  expect(data, 'сервер возвращает объект с описанием ошибки')
    .that.is.an('object')
    .to.have.property('error');
}
