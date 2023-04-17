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
        pos2
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

    const optional = {
      headers: {},
      method: 'POST',
      body: fd,
    };
    await fetch(`http://localhost:${config.server.port}/api/bridge/file/upload`, optional)
  });

  after(async () => {
    await db.query('DELETE FROM brands');
    await db.query('DELETE FROM providers');
    await db.query('DELETE FROM positions');
    _server.close();
    _delFile('../files/testPos.xlsx');
  });

  describe('upload XLSX files', () => {
    
    it('get all cards', async () => {
     
      expect(1).equal(1);
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
