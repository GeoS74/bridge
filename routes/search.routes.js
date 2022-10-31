const Router = require('koa-router');

const position = require('../controllers/search.controller');

const router = new Router({ prefix: '/api/search' });

router.get(
  '/',
  position.search,
);

module.exports = router.routes();
