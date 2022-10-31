const Router = require('koa-router');
const { readFile } = require('fs/promises');
const path = require('path');
const { Converter } = require('md-conv');

const template = require('../templates/docs.page');

const router = new Router({ prefix: '/docs' });
const converter = new Converter({ prefix: '/docs' });

router.get('/', async (ctx) => ctx.redirect('/docs/main'));

router.get('/:fname', async (ctx) => {
  try {
    const { fname } = ctx.params;
    const md = await readFile(path.join(__dirname, `../docs/${fname}.md`), { encoding: 'utf8' });
    ctx.set('content-type', 'text/html; charset=utf-8');
    ctx.body = template(fname, converter.markdownToHTML(md));
  } catch (error) {
    ctx.status = 404;
    ctx.body = 'Not Found';
  }
});

module.exports = router.routes();
