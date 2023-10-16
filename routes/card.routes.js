const { readdir, mkdir } = require('node:fs/promises');
const Router = require('koa-router');
const koaBody = require('koa-body');
const serve = require('koa-static');
const mount = require('koa-mount');
const accessCheck = require('../middleware/access.check');

const controller = require('../controllers/card.controller');
const validator = require('../middleware/validators/card.params.validator');

(async () => {
  try {
    await readdir('./files/photo');
  } catch (error) {
    mkdir('./files/photo', {
      recursive: true,
    });
  }
})();

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

const router = new Router({ prefix: '/api/bridge/card' });

router.get(
  '/:id',
  validator.id,
  controller.get,
);

router.get(
  '/product/:alias',
  validator.alias,
  controller.getByAlias,
);

router.patch(
  '/:id/photo',
  accessCheck,
  validator.id,
  koaBody(optional),
  validator.photo,
  controller.photo,
);

router.get(
  '/all/count',
  controller.getCountCards,
);

router.get(
  '/',
  validator.param,
  controller.getCards,
);

module.exports.routes = router.routes();

// static files
module.exports.static = mount('/api/bridge/card/photo', serve('./files/photo'));
