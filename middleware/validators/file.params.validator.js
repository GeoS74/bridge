const fs = require('fs');

const logger = require('../../libs/logger');

module.exports.file = async (ctx, next) => {
  if (!ctx.request.files) {
    ctx.throw(400, 'file not uploaded');
  }

  if (Object.keys(ctx.request.files).length > 1) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'more than one file received');
  }

  if (Object.keys(ctx.request.files).indexOf('file') === -1) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'field name "file" is empty');
  }

  // if (ctx.request.files.file.size < 27000) {
  //   _deleteFile(ctx.request.files);
  //   ctx.throw(400, 'file is empty');
  // }

  switch (ctx.request.files.file.mimetype) {
    case 'application/vnd.ms-excel': break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': break;
    default:
      _deleteFile(ctx.request.files);
      ctx.throw(400, 'file must be in excel format');
  }

  await next();
};

module.exports.params = async (ctx, next) => {
  const brandId = parseInt(ctx.request?.body?.brand_id, 10);
  if (!brandId) {
    _deleteFile(ctx.request.files);
    ctx.throw(404, 'brand not found');
  }
  ctx.request.body.brandId = brandId;

  const providerId = parseInt(ctx.request?.body?.provider_id, 10);
  if (!providerId) {
    _deleteFile(ctx.request.files);
    ctx.throw(404, 'provider not found');
  }
  ctx.request.body.providerId = providerId;

  await next();
};

function _deleteFile(files) {
  for (const file of Object.values(files)) {
    fs.unlink(file.filepath, (err) => {
      if (err) logger.error(err);
    });
  }
}
