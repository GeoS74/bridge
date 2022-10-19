const Router = require('koa-router');
const koaBody = require('koa-body');

const controller = require('../controllers/provider.controller');
const validator = require('../middleware/validators/provider.params.validator');

const router = new Router({ prefix: '/api/providers' });

router.get('/:id', validator.id, controller.get);
router.get('/', controller.getAll);
router.post('/', koaBody({ multipart: true }), validator.title, controller.add);
router.patch('/:id', koaBody({ multipart: true }), validator.id, validator.title, controller.update);
router.delete('/:id', validator.id, controller.delete);

module.exports = router.routes();
