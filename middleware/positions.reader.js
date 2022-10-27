const XLSX = require('xlsx');
const fs = require('fs');

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
  };

  await next();
};

module.exports.file = async (ctx, next) => {
  ctx.positions = _readExceltoArray(ctx.request.files.file.filepath);
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
  };

  const startRow = ctx.request.body?.startRow;
  if (startRow) {
    ctx.positions = ctx.positions.slice(startRow - 1);
  }

  await next();
};

function _getColumnNumber(name) {
  const columnNumber = parseInt(name, 10) || columnNameToNumber(name);
  return columnNumber ? columnNumber - 1 : null;
}

function _readExceltoArray(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
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
