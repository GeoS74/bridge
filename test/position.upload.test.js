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

if (process.env.NODE_ENV !== 'develop') {
  logger.warn('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

describe('/test/position.upload.test.js', () => {
  let _server;
  let brandId;
  let providerId;
  const pos1 = ['8608014*01 5557', 'Бак масляный без фильтра (самосвальная установка)', '777', '10'];
  const pos2 = ['4320X-1201010-01', 'Агрегат насосный в сборе ШААЗ', '1500', '15'];

  before(async () => {
    _server = app.listen(config.server.port);
    brandId = await _setBrand();
    providerId = await _setProvider();
    await _createTestFileXLSX(
      'test1',
      [
        ['article', 'title', 'price', 'amount'],
        pos1,
      ],
    );
    await _createTestFileXLS(
      'test2',
      [
        ['article', 'title', 'price', 'amount'],
        pos2,
      ],
    );
    _createTestFileTXT('test3');
  });

  after(async () => {
    await db.query('DELETE FROM brands');
    await db.query('DELETE FROM providers');
    _server.close();
    _delFile('../files/test1.xlsx');
    _delFile('../files/test2.xls');
    _delFile('../files/test3.txt');
  });

  describe('upload XLSX files', () => {
    const optional = {
      headers: {},
      method: 'POST',
      body: null,
    };

    it('file uploaded', async () => {
      const fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      fd.append('brandId', brandId);
      fd.append('providerId', providerId);
      fd.append('article', 1);
      fd.append('title', 2);
      fd.append('price', 3);
      fd.append('amount', 4);
      fd.append('startRow', 2);
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);

      const newPos = await _getPosition(pos1[0], brandId, providerId);
      expect(pos1[0]).equal(newPos.article);
      expect(pos1[1]).equal(newPos.title);
      expect(+pos1[2]).equal(newPos.price);
      expect(+pos1[3]).equal(newPos.amount);
    });
  });

  describe('upload XLS files', () => {
    const optional = {
      headers: {},
      method: 'POST',
      body: null,
    };

    it('file uploaded', async () => {
      const fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test2.xls')));
      fd.append('brandId', brandId);
      fd.append('providerId', providerId);
      fd.append('article', 1);
      fd.append('title', 2);
      fd.append('price', 3);
      fd.append('amount', 4);
      fd.append('startRow', 2);
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 200').to.be.equal(200);

      const newPos = await _getPosition(pos2[0], brandId, providerId);
      expect(pos2[0]).equal(newPos.article);
      expect(pos2[1]).equal(newPos.title);
      expect(+pos2[2]).equal(newPos.price);
      expect(+pos2[3]).equal(newPos.amount);
    });
  });

  describe('validate file params', () => {
    const optional = {
      headers: {},
      method: 'POST',
      body: null,
    };

    it('file params validator', async () => {
      // file not uploaded
      let fd = new FormData();
      optional.body = fd;

      let response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      // more than one file received
      fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      fd.append('file1', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      // field name "file" is empty
      fd = new FormData();
      fd.append('myFile', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      // more than 1 file received by field "file"
      fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });

    it('positions params validate', async () => {
      // empty brandId and providerId
      let fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      optional.body = fd;

      let response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      // empty providerId
      fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      fd.append('brandId', brandId);
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);

      // empty brandId
      fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test1.xlsx')));
      fd.append('providerId', providerId);
      optional.body = fd;

      response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });
  });

  describe('upload only XLS and XLSX files', () => {
    const optional = {
      headers: {},
      method: 'POST',
      body: null,
    };

    it('validate mime type', async () => {
      const fd = new FormData();
      fd.append('file', fs.createReadStream(path.join(__dirname, '../files/test3.txt')));
      optional.body = fd;

      const response = await fetch(`http://localhost:${config.server.port}/api/file/upload`, optional)
        .then(_getData);
      expect(response.status, 'сервер возвращает статус 400').to.be.equal(400);
      _expectErrorFieldState.call(this, response.data);
    });
  });
});

function _getPosition(article, brandId, providerId) {
  return db.query(
    `SELECT * from positions P
  JOIN prices M
  ON P.id=M.position_id
  WHERE 
    article=$1 AND 
    brand_id=$2 AND 
    provider_id=$3 AND
    M.createdat = (
      select max(createdat) from prices D
      where M.position_id=D.position_id
    )`,
    [article, brandId, providerId],
  )
    .then((res) => res.rows[0]);
}

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

async function _createTestFileXLS(fname, arr) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(arr);
  XLSX.utils.book_append_sheet(wb, ws, fname);
  await XLSX.writeFile(wb, path.join(__dirname, `../files/${fname}.xls`), {
    bookType: 'xls',
  });
}

function _createTestFileTXT(fname) {
  const writer = fs.createWriteStream(path.join(__dirname, `../files/${fname}.txt`), { flags: 'a' });
  writer.write(new Array(10000).fill('text').toString());
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
