const Router = require('koa-router');

const card = require('../controllers/card.controller');
const validator = require('../middleware/validators/card.params.validator');

const router = new Router({ prefix: '/api/bridge/card' });

router.get(
  '/:id',
  validator.id,
  card.get,
);

router.get(
  '/',
  validator.param,
  card.getCards,
);

module.exports = router.routes();
