const Router = require('koa-router');
const koaBody = require('koa-body');

const validator = require('../middleware/validators/ut.params.validator');
const reader = require('../middleware/positions.reader');
const position = require('../controllers/position.controller');

const router = new Router({ prefix: '/api/ut' });

router.post(
  '/upload', 
  koaBody({
    jsonLimit: '1mb',
    formLimit: '1mb',
  }), 
  validator, 
  reader.json,
  position.addBovid,
);

router.get('/foo', position.foo)

module.exports = router.routes();