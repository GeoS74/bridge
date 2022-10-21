const XLSX = require('xlsx');
const fs = require('fs');

const logger = require('../libs/logger');

module.exports.json = async (ctx, next) => {
  try {
    ctx.positions = JSON.parse(ctx.request.body.json_data);
  } catch (error) {
    ctx.throw(400, 'bad json')
  }

  ctx.structure = {
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
  }

  await next();
};

module.exports.file = async (ctx, next) => {
  ctx.positions = _readExceltoArray(ctx.request.files.file.filepath);
  _delFile(ctx.request.files.file.filepath);

  ctx.structure = {
    code: ctx.request.body?.code,
    article: ctx.request.body?.article,
    title: ctx.request.body?.title,
    weight: ctx.request.body?.weight,
    width: ctx.request.body?.width,
    height: ctx.request.body?.height,
    length: ctx.request.body?.length,
    manufacturer: ctx.request.body?.manufacturer,
    storage: null,
    price: ctx.request.body?.price,
  }

  await next();

  // console.log(ctx.positions.slice(10, 11));
  // ctx.status = 200;
  // ctx.body = 'ok'
};

function _readExceltoArray(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const opts = {
    // header: 'A',
    defval: '',
  };
  return XLSX.utils.sheet_to_json(worksheet, opts);
}

function _delFile(filepath) {
  fs.unlink(filepath, (err) => {
    if (err) logger.error(err);
  });
}