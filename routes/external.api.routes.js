const Router = require('koa-router');

const position = require('../controllers/external.api.controller');
// const accessCheck = require('../middleware/access.check');

const router = new Router({ prefix: '/api/bridge/external' });

router.get(
  '/voshod',
  position.countPages,
  position.reader,
);

module.exports = router.routes();
