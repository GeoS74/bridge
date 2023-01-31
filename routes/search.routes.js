const Router = require('koa-router');

const position = require('../controllers/search.controller');
const validator = require('../middleware/validators/search.query.params.validator');

const router = new Router({ prefix: '/api/bridge/search' });

router.get(
  '/',
  validator,
  position.search,
);

module.exports = router.routes();
