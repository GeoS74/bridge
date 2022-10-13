const XLSX = require('xlsx');
const fs = require('fs');

module.exports.upload = async (ctx, next) => {
  ctx.positions = _readExceltoArray(ctx.request.files.file.filepath);
  _delFile(ctx.request.files.file.filepath);
  await next();
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
