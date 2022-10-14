const Router = require('koa-router');
const koaBody = require('koa-body');

const fileController = require('../controllers/file.controller');
const fileValidator = require('../middleware/validators/file.params.validator');
const positionController = require('../controllers/position.controller');
const positionValidator = require('../middleware/validators/position.params.validator');

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
  fileValidator.params,
  fileController.upload,
  positionValidator.params,
  positionController.add,
);

module.exports = router.routes();
