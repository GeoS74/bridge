const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const router = new Router({ prefix: '' });

router.get('/', async (ctx) => ctx.redirect('/main'));

router.get('/:fname', async (ctx) => {
  try {
    const { fname } = ctx.params;
    ctx.set('content-type', 'text/html; charset=utf-8');
    ctx.body = fs.createReadStream(path.join(__dirname, `../client/${fname}.html`));
  } catch (error) {
    ctx.status = 404;
    ctx.body = 'Not Found';
  }
});

module.exports = router.routes();
