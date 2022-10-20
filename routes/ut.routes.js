const Router = require('koa-router');
const koaBody = require('koa-body');

const router = new Router({ prefix: '/api/ut' });
const utValidator = require('../middleware/validators/ut.params.validator');
const utController = require('../controllers/ut.controller');
const positionController = require('../controllers/position.controller');

router.post(
  '/upload', 
  koaBody(), 
  utValidator.params, 
  utController.upload,
  positionController.addBovid,
);

module.exports = router.routes();