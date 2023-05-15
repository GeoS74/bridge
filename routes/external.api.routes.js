const Router = require('koa-router');

const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const position = require('../controllers/external.api.controller');
const accessCheck = require('../middleware/access.check');
const { timer } = require('../libs/myfunc');
const config = require('../config');

const router = new Router({ prefix: '/api/bridge/external' });

router.get(
  '/voshod',
  accessCheck,
  position.countPages,
  // position.readerV1,
  position.readerV2,
);

router.get(
  '/voshod/update',
  // accessCheck,
  position.getPositions,
  position.readerV3,
);

module.exports = router.routes();

timer([
  '05:00:00',
  // '07:00:00',
  '09:00:00',
  // '10:00:00',
  '13:00:00',
  // '16:00:00',
], () => {
  const token = jwt.sign('say hi', config.jwt.secretKey);
  // этот fetch упадёт если к роуту '/voshod' подключить accessCheck и не передать токен
  fetch(`http://${config.server.host}:${config.server.port}/api/bridge/external/voshod/update`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
