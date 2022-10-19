const XLSX = require('xlsx');
const fs = require('fs');

const logger = require('../libs/logger');

module.exports.upload = async (ctx, next) => {
  ctx.positions = _readExceltoArray(ctx.request.files.file.filepath);
  _delFile(ctx.request.files.file.filepath);
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
