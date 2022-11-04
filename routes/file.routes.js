const Router = require('koa-router');
const koaBody = require('koa-body');

const fileValidator = require('../middleware/validators/file.params.validator');
const positionValidator = require('../middleware/validators/position.params.validator');
const reader = require('../middleware/positions.reader');
const position = require('../controllers/position.controller');

const optional = {
  formidable: {
    uploadDir: './files',
    allowEmptyFiles: false,
    minFileSize: 1,
    multiples: true,
    hashAlgorithm: 'md5',
    keepExtensions: true,
  },
  multipart: true,
};

const router = new Router({ prefix: '/api/file' });

router.post(
  '/upload',
  koaBody(optional),
  fileValidator,
  positionValidator,
  reader.file,
  position.add,
);

router.post(
  '/upload/ut',
  koaBody(optional),
  fileValidator,
  reader.file,
  position.addBovid,
);

module.exports = router.routes();
