const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const logger = require('../libs/logger');
const columnNameToNumber = require('../libs/column.name.converter');

module.exports.json = async (ctx, next) => {
  try {
    const positions = JSON.parse(ctx.request.body.json_data);

    if (!Array.isArray(positions)) {
      throw new Error();
    }

    ctx.positions = positions;
  } catch (error) {
    ctx.throw(400, 'bad json');
  }

  ctx.structure = {
    uid: 'id',
    code: 'code',
    article: 'article',
    title: 'name',
    weight: 'weight',
    width: 'width',
    height: 'height',
    length: 'length',
    manufacturer: 'manufacturer',
    storage: 'storage',
    price: null,
    amount: null,
  };

  await next();
};

module.exports.file = async (ctx, next) => {
  ctx.positions = _readExceltoArray(ctx.request.files.file.filepath, 0);
  _delFile(ctx.request.files.file.filepath);

  ctx.structure = {
    uid: null,
    code: _getColumnNumber(ctx.request.body?.code),
    article: _getColumnNumber(ctx.request.body?.article),
    title: _getColumnNumber(ctx.request.body?.title),
    weight: _getColumnNumber(ctx.request.body?.weight),
    width: _getColumnNumber(ctx.request.body?.width),
    height: _getColumnNumber(ctx.request.body?.height),
    length: _getColumnNumber(ctx.request.body?.length),
    manufacturer: _getColumnNumber(ctx.request.body?.manufacturer),
    storage: null,
    price: _getColumnNumber(ctx.request.body?.price),
    amount: _getColumnNumber(ctx.request.body?.amount),
  };
  ctx.positions = _cutArray(ctx.positions, ctx.request.body?.startRow, ctx.request.body?.endRow);

  await next();
};

function _cutArray(arr, startRow, endRow) {
  startRow = parseInt(startRow, 10) || 1;
  endRow = parseInt(endRow, 10) || 0;
  return endRow ? arr.slice(startRow - 1, endRow) : arr.slice(startRow - 1);
}

function _getColumnNumber(name) {
  const columnNumber = parseInt(name, 10) || columnNameToNumber(name);
  return columnNumber ? columnNumber - 1 : null;
}

function _readExceltoArray(filePath, numSheet) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[numSheet || 0];
  const worksheet = workbook.Sheets[sheetName];
  const opts = {
    header: 1,
    defval: '',
  };
  return XLSX.utils.sheet_to_json(worksheet, opts);
}

function _delFile(filepath) {
  fs.unlink(filepath, (err) => {
    if (err) logger.error(err);
  });
}

/*
* функции чтения прайса redial-trade
*/
module.exports.structure = async (ctx, next) => {
  ctx.structure = {
    uid: null,
    code: null,
    article: _getColumnNumber(1),
    title: _getColumnNumber(2),
    weight: null,
    width: null,
    height: null,
    length: null,
    manufacturer: _getColumnNumber(3),
    storage: null,
    price: _getColumnNumber(5),
    amount: _getColumnNumber(4),
  };

  await next();
};

function _makeBearingTitle(one, two) {
  return one ? `${one}-${two}` : two;
}

module.exports.readPriceOpt = async (ctx, next) => {
  const positions = [];
  let res = _readExceltoArray(ctx.request.files.file.filepath, 0);
  res = _cutArray(res, 7);

  res.forEach((e) => {
    positions.push([
      e[0] ? `${e[0]}-${e[1]}` : e[1], // article
      `Подшипник ${_makeBearingTitle(e[0], e[1])}`, // title
      e[2], // manufactured
      e[3], // amount
      e[4], // price
    ]);

    positions.push([
      e[6] ? `${e[6]}-${e[7]}` : e[7],
      `Подшипник ${_makeBearingTitle(e[6], e[7])}`, // title
      e[8],
      e[9],
      e[10],
    ]);

    positions.push([
      e[12] ? `${e[12]}-${e[13]}` : e[13],
      `Подшипник ${_makeBearingTitle(e[12], e[13])}`, // title
      e[14],
      e[15],
      e[16],
    ]);

    positions.push([
      e[18] ? `${e[18]}-${e[19]}` : e[19], // article
      `Подшипник ${_makeBearingTitle(e[18], e[19])}`, // title
      e[20], // manufactured
      e[21], // amount
      e[22], // price
    ]);
  });

  ctx.positions = positions.filter((e) => e[0] !== '');

  await next();
};

module.exports.readPriceImp = async (ctx, next) => {
  const positions = [];
  let res = _readExceltoArray(ctx.request.files.file.filepath, 1);
  res = _cutArray(res, 3);

  res.forEach((e) => {
    positions.push([
      e[1], // article
      e[0], // title
      e[6], // manufacturer
      e[7], // amount
      e[8], // price
    ]);
  });

  const pos = positions.filter((e) => {
    if (!e[1] && !e[2] && !e[3] && !e[4]) return false;
    return true;
  });
  ctx.positions = ctx.positions.concat(pos);

  await next();
};

module.exports.readPriceStopRing = async (ctx, next) => {
  const positions = [];
  let res = _readExceltoArray(ctx.request.files.file.filepath, 2);
  res = _cutArray(res, 7);

  res.forEach((e) => {
    positions.push([
      e[4], // article
      `Стопорное кольцо ГОСТ ${e[1]} Инд ${e[2]}`, // title
      '', // manufacturer
      e[5], // amount
      e[6], // price
    ]);

    positions.push([
      e[11], // article
      `Стопорное кольцо ГОСТ ${e[8]} Инд ${e[9]}`, // title
      '', // manufacturer
      e[12], // amount
      e[13], // price
    ]);
  });

  const pos = positions.filter((e) => e[0] !== '');
  ctx.positions = ctx.positions.concat(pos);

  await next();
};

module.exports.readPriceTools = async (ctx, next) => {
  const positions = [];
  let res = _readExceltoArray(ctx.request.files.file.filepath, 3);
  res = _cutArray(res, 4);

  res.forEach((e) => {
    positions.push([
      `Размер: ${e[2]}`, // article
      e[1], // title
      e[4], // manufacturer
      e[5], // amount
      e[6], // price
    ]);
  });

  ctx.positions = ctx.positions.concat(positions);

  await next();
};

module.exports.renameUploadPrice = async (ctx, next) => {
  const priceName = 'redial-trade-price.xls';
  const newPath = path.join(__dirname, '../files', priceName);
  _renameUploadPriceFile(ctx.request.files.file.filepath, newPath);
  await next();
};

function _renameUploadPriceFile(oldPath, newPath) {
  fs.rename(oldPath, newPath, (err) => {
    if (err) logger.error(err);
  });
}
