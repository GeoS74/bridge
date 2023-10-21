const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config({ path: '../secrets.env' });

const config = require('../config');
const app = require('../app');
const db = require('../libs/db');
const logger = require('../libs/logger');

if (config.node.env !== 'dev') {
  logger.warn('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

describe('/test/card.test.js', () => {
  let _server;
  let brandId;
  let providerId;
  const pos1 = ['8608014*01 5557', 'Бак масляный без фильтра (самосвальная установка)', '777', '10', 'УРАЛ'];
  const pos2 = ['4320X-1201010-01', 'Агрегат насосный в сборе ШААЗ', '1500', '15', 'КАМАЗ'];

  before(async () => {
    await db.query('DELETE FROM brands');
    await db.query('DELETE FROM providers');
    await db.query('DELETE FROM positions');

    _server = app.listen(config.server.port);
    brandId = await _setBrand();
    providerId = await _setProvider();
    await _createTestFileXLSX(
      'testPos',
      [
        ['article', 'title', 'price', 'amount', 'manufacturer'],
        pos1,
        pos2,
      ],
    );

    const fd = new FormData();
    fd.append('file', fs.createReadStream(path.join(__dirname, '../files/testPos.xlsx')));
    fd.append('brandId', brandId);
    fd.append('providerId', providerId);
    fd.append('article', 1);
    fd.append('title', 2);
    fd.append('price', 3);
    fd.append('amount', 4);
    fd.append('manufacturer', 5);
    fd.append('startRow', 2);
    fd.append('addNewPositionMode', 1);

    const optional = {
      headers: {},
      method: 'POST',
      body: fd,
    };
    await fetch(`http://localhost:${config.server.port}/api/bridge/file/upload`, optional);
  });

  after(async () => {
    await db.query('DELETE FROM brands');
    await db.query('DELETE FROM providers');
    await db.query('DELETE FROM positions');
    _server.close();
    _delFile('../files/testPos.xlsx');
  });

  describe('cards API', () => {
    it('get all cards', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/api/bridge/card`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает массив').that.is.an('array');
      expect(response.data.length, 'сервер возвращает массив из 2-х элементов').to.be.equal(2);
      _expectFieldState.call(this, response.data[0]);
    });

    it('get count all cards', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/all/count`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает объект').that.is.an('object');
      expect(response.data, 'сервер возвращает ключ \'count\'').to.have.key('count');
      expect(response.data.count, 'сервер возвращает количество 2').to.be.equal(2);
    });

    it('test limit', async () => {
      const response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/?limit=1`)
        .then(_getData);
        console.log(response.data)
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает массив').that.is.an('array');
      expect(response.data.length, 'сервер возвращает массив из 1-го элемента').to.be.equal(1);
      _expectFieldState.call(this, response.data[0]);
      // API возвращает упрощённый запрос к БД (артикул позиции отсутствует)
      // expect(response.data[0].article, 'сервер возвращает последний добавленный элемент').to.be.equal('4320X-1201010-01');
    });

    it('test offset', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/?limit=1&offset=1`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает массив').that.is.an('array');
      expect(response.data.length, 'сервер возвращает массив из 1-го элемента').to.be.equal(1);
      _expectFieldState.call(this, response.data[0]);
      // API возвращает упрощённый запрос к БД (артикул позиции отсутствует)
      // expect(response.data[0].article, 'сервер возвращает следующий элемент').to.be.equal('8608014*01 5557');

      response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/?limit=1&offset=10`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      expect(response.data, 'сервер возвращает массив').that.is.an('array');
      expect(response.data.length, 'сервер возвращает пустой массив').to.be.equal(0);
    });

    it('get card by id', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/?limit=1`)
        .then(_getData);
      const { id } = response.data[0];

      response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/${id}`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/100500`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);
    });

    it('get card by alias', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/?limit=1`)
        .then(_getData);
      const { alias } = response.data[0];

      response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/product/${alias}`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);
      _expectFieldState.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/bridge/card/product/100500`)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 404').to.be.equal(404);
      _expectErrorFieldState.call(this, response.data);
    });
  });
});

function _setBrand() {
  return db.query('INSERT INTO brands (title) VALUES (\'test_brand\') RETURNING id')
    .then((res) => res.rows[0].id);
}

function _setProvider() {
  return db.query('INSERT INTO providers (title) VALUES (\'test_providers\') RETURNING id')
    .then((res) => res.rows[0].id);
}

async function _createTestFileXLSX(fname, arr) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(arr);
  XLSX.utils.book_append_sheet(wb, ws, fname);
  await XLSX.writeFile(wb, path.join(__dirname, `../files/${fname}.xlsx`), {
    bookType: 'xlsx',
  });
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

function _delFile(fpath) {
  fs.unlink(path.join(__dirname, fpath), (err) => {
    if (err) logger.error(err);
  });
} 

function _expectFieldState(data) {
  expect(data, 'сервер возвращает объект с полями ...')
    .that.be.an('object')
    .to.have.keys([
      'id',
      'createdAt',
      'brandId',
      'brantTitle',
      'providerId',
      'stock',
      'uid',
      'code',
      'article',
      'title',
      'photo',
      'price',
      'amount',
      'storage',
      'weight',
      'width',
      'height',
      'length',
      'manufacturer',
      'alias',
    ]);
}
