const fs = require('fs');

const logger = require('../../libs/logger');

module.exports = async (ctx, next) => {
  const brandId = parseInt(ctx.request?.body?.brandId, 10);
  if (!brandId) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'brand not found');
  }
  ctx.request.body.brandId = brandId;

  const providerId = parseInt(ctx.request?.body?.providerId, 10);
  if (!providerId) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'provider not found');
  }
  ctx.request.body.providerId = providerId;

  ctx.request.body.profit = parseInt(ctx.request?.body?.profit, 10) || 0;

  ctx.request.body.addNewPositionMode = !!ctx.request?.body?.addNewPositionMode;

  await next();
};

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
