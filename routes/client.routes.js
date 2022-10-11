const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const router = new Router({ prefix: '' });

router.get('/', async (ctx) => {
  ctx.set('content-type', 'text/html; charset=utf-8');
  ctx.body = fs.createReadStream(path.join(__dirname, '../client/main.html'));
});

router.get('/upload', async (ctx) => {
  ctx.set('content-type', 'text/html; charset=utf-8');
  ctx.body = fs.createReadStream(path.join(__dirname, '../client/upload.price.html'));
});

router.get('/catalog', async (ctx) => {
  ctx.set('content-type', 'text/html; charset=utf-8');
  ctx.body = fs.createReadStream(path.join(__dirname, '../client/catalog.html'));
});

router.get('/brands', async (ctx) => {
  ctx.set('content-type', 'text/html; charset=utf-8');
  ctx.body = fs.createReadStream(path.join(__dirname, '../client/brands.html'));
});

module.exports = router.routes();
