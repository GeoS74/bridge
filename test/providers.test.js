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

describe('/test/providers.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await db.query('DELETE FROM prices');
    await db.query('DELETE FROM positions');
    await db.query('DELETE FROM providers');
    _server.close();
  });

  describe('providers CRUD', () => {
    it('create providers', async () => {
      const brand = {
        title: 'КАМАЗ',
      };
      const optional = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(brand),
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/providers`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 201').to.be.equal(201);
      _expectFieldState.call(this, response.data);
      expect(response.data.title, 'сервер возвращает новый title').to.be.equal(brand.title);

      optional.body = JSON.stringify({});
      response = await fetch(`http://localhost:${config.server.port}/api/providers`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });

    it('read providers', async () => {
      const optional = {
        headers: {},
        method: 'GET',
      };

      let response = await fetch(`http://localhost:${config.server.port}/api/providers`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает массив').that.is.an('array');
      _expectFieldState.call(this, response.data[0]);

      response = await fetch(`http://localhost:${config.server.port}/api/providers/${response.data[0].id}`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);

      const nextId = await _getNextId();

      response = await fetch(`http://localhost:${config.server.port}/api/providers/${nextId}`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/providers/any`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);
    });

    it('update providers', async () => {
      const brand = {
        title: 'тест',
      };
      const optional = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(brand),
      };

      const currBrand = await _getProviders();

      let response = await fetch(`http://localhost:${config.server.port}/api/providers/${currBrand.id}`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);
      expect(response.data.title, 'сервер возвращает новый title').to.be.equal(brand.title);

      const nextId = await _getNextId();

      response = await fetch(`http://localhost:${config.server.port}/api/providers/${nextId}`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/providers/any`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);
    });

    it('delete providers', async () => {
      const optional = {
        headers: {},
        method: 'DELETE',
      };

      const currBrand = await _getProviders();

      let response = await fetch(`http://localhost:${config.server.port}/api/providers/${currBrand.id}`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);
      expect(response.data.title, 'сервер возвращает удалённый title').to.be.equal(currBrand.title);

      response = await fetch(`http://localhost:${config.server.port}/api/providers/${currBrand.id}`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);
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

async function _getNextId() {
  return db.query("select nextval('providers_id_seq') as id")
    .then((res) => res.rows[0].id);
}

async function _getProviders() {
  return db.query('select id, title from providers limit 1')
    .then((res) => res.rows[0]);
}
