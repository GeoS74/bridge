const XLSX = require('xlsx');
const fs = require('fs');

const logger = require('../libs/logger');

module.exports.upload = async (ctx) => {
  try {
    const start = Date.now();
    const positions = _readExceltoArray(ctx.request.files.file.filepath);
    _delFile(ctx.request.files.file.filepath);

    ctx.status = 200;
    ctx.body = {
      message: 'file upload',
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      ctx.throw(404, 'file not found');
    }
    throw error;
  }
};

function _readExceltoArray(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

function _delFile(filepath) {
  fs.unlink(filepath, (err) => {
    if (err) logger.error(err);
  });
}
