const Router = require('koa-router');
const koaBody = require('koa-body');

const fileValidator = require('../middleware/validators/file.params.validator');
const positionValidator = require('../middleware/validators/position.params.validator');
const structureValidator = require('../middleware/validators/file.structure.validator');
const reader = require('../middleware/positions.reader');
const position = require('../controllers/position.controller');
const accessCheck = require('../middleware/access.check');

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

const router = new Router({ prefix: '/api/bridge/file' });

router.post(
  '/upload',
  accessCheck,
  koaBody(optional),
  fileValidator,
  positionValidator,
  structureValidator,
  reader.file,
  position.add,
);

/*
* роут загрузки прайса redial-trade
*/
router.post(
  '/upload/redial-trade',
  accessCheck,
  koaBody(optional),
  fileValidator,
  positionValidator,
  reader.readPriceOpt,
  reader.readPriceImp,
  reader.readPriceStopRing,
  reader.readPriceTools,
  reader.structureRT,
  reader.renameUploadPrice,
  position.add,
);

/*
* роут для загрузки позиций компании из Excel
* этот подход не должен применяться,
* т.к. выгрузка торговых позиций компании должна осуществляться через роут ut.routes
* в формате json
*/
// router.post(
//   '/upload/ut',
//   koaBody(optional),
//   fileValidator,
//   reader.file,
//   position.addBovid,
// );

router.get(
  '/download',
  position.download,
);
/*
* роут скачивания прайса redial-trade
*/
router.get(
  '/download/redial-trade',
  position.downloadRedialTradePrice,
);

module.exports = router.routes();
