const Router = require('koa-router');

const fetch = require('node-fetch');
const position = require('../controllers/external.api.controller');
// const accessCheck = require('../middleware/access.check');
const { timer } = require('../libs/myfunc');
const config = require('../config');

const router = new Router({ prefix: '/api/bridge/external' });

router.get(
  '/voshod',
  position.countPages,
  // position.readerV1,
  position.readerV2,
);

module.exports = router.routes();

timer(['07:00:00', '10:00:00', '13:00:00', '16:00:00'], () => {
  fetch(`http://${config.server.host}:${config.server.port}/api/bridge/external/voshod`);
});
