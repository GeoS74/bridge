const Router = require('koa-router');
const koaBody = require('koa-body');

const controller = require('../controllers/file.controller');
const validator = require('../middleware/validators/file.params.validator');

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

router.post('/upload', koaBody(optional), validator.file, validator.params, controller.upload);

module.exports = router.routes();
