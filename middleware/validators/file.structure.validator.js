const fs = require('fs');
const logger = require('../../libs/logger');
const columnNameToNumber = require('../../libs/column.name.converter');

module.exports = async (ctx, next) => {
  ctx.structure = _getStructure(ctx.request.body);

  if (ctx.structure.article) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'article is empty');
  }

  if (!ctx.structure.title) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'title is empty');
  }

  await next();
};

function _getStructure(body) {
  return {
    uid: null,
    code: _getColumnNumber(body?.code),
    article: _getColumnNumber(body?.article),
    title: _getColumnNumber(body?.title),
    weight: _getColumnNumber(body?.weight),
    width: _getColumnNumber(body?.width),
    height: _getColumnNumber(body?.height),
    length: _getColumnNumber(body?.length),
    manufacturer: _getColumnNumber(body?.manufacturer),
    storage: null,
    price: _getColumnNumber(body?.price),
    amount: _getColumnNumber(body?.amount),
  };
}

function _getColumnNumber(name) {
  const columnNumber = parseInt(name, 10) || columnNameToNumber(name);
  return columnNumber ? columnNumber - 1 : null;
}

function _deleteFile(files) {
  for (const file of Object.values(files)) {
    // received more than 1 file in any field with the same name
    if (Array.isArray(file)) {
      _deleteFile(file);
    } else {
      fs.unlink(file.filepath, (err) => {
        if (err) logger.error(err);
      });
    }
  }
}
