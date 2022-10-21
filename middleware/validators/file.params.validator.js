const fs = require('fs');

const logger = require('../../libs/logger');

module.exports = async (ctx, next) => {
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

  if (Array.isArray(ctx.request.files.file)) {
    _deleteFile(ctx.request.files);
    ctx.throw(400, 'more than 1 file received by field "file"');
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
