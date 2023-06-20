const fs = require('fs/promises');

const logger = require('../../libs/logger');

module.exports.id = async (ctx, next) => {
  const id = parseInt(ctx.params.id, 10);
  if (!id) {
    ctx.throw(404, 'card not found');
  }
  ctx.params.id = id;
  await next();
};

module.exports.alias = async (ctx, next) => {
  const alias = ctx.params.alias.toString().trim();
  if (!alias) {
    ctx.throw(404, 'card not found');
  }
  ctx.params.alias = alias;
  await next();
};

module.exports.param = async (ctx, next) => {
  ctx.query.limit = parseInt(ctx.query?.limit, 10) || 10;
  if (ctx.query.limit > 150) {
    ctx.query.limit = 150;
  }
  ctx.query.offset = parseInt(ctx.query?.offset, 10) || 0;
  await next();
};

module.exports.photo = async (ctx, next) => {
  if (!ctx.request?.files) {
    ctx.throw(400, 'file not uploaded');
  }

  if (Object.keys(ctx.request.files).length > 1) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'more than one file received');
  }

  if (Object.keys(ctx.request.files).indexOf('photo') === -1) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'field name "photo" is empty');
  }

  if (Array.isArray(ctx.request.files.photo)) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'more than 1 file received by field "photo"');
  }

  // if (ctx.request.files.file.size < 27000) {
  //   _deleteFile(ctx.request.files);
  //   ctx.throw(400, 'file is empty');
  // }

  if (!/^image\/\w+/.test(ctx.request.files.photo.mimetype)) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'file must be image');
  }

  ctx.photo = ctx.request.files.photo;

  await next();
};

function _deleteFile(files) {
  for (const file of Object.values(files)) {
    // received more than 1 file in any field with the same name
    if (Array.isArray(file)) {
      _deleteFile(file);
    } else {
      fs.unlink(file.filepath)
        .catch((error) => logger.error(error.mesasge));
    }
  }
}
