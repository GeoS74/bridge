const Router = require('koa-router');
const koaBody = require('koa-body');

const validator = require('../middleware/validators/ut.params.validator');
const reader = require('../middleware/positions.reader');
const position = require('../controllers/position.controller');

const router = new Router({ prefix: '/api/bridge/ut' });

router.post(
  '/upload',
  koaBody({
    jsonLimit: '2mb',
    formLimit: '2mb',
  }),
  validator,
  reader.json,
  position.addBovid,
);

module.exports = router.routes();
