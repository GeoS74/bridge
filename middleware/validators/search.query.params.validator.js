module.exports = async (ctx, next) => {
  let query = ctx.query?.query;

  if (!query) {
    ctx.throw(400, 'params "query" is empty');
  }

  query = query.toString()
    .toLowerCase()
    .trim()
    .match(/[a-zа-я\d]+/g) || [];

  if (!query.length) {
    ctx.throw(404, 'position not a found');
  }

  ctx.query.limit = parseInt(ctx.query?.limit, 10) || 10;
  if (ctx.query.limit > 50) {
    ctx.query.limit = 50;
  }
  ctx.query.offset = parseInt(ctx.query?.offset, 10) || 0;
  ctx.query.liastId = parseInt(ctx.query?.last, 10) || 0;

  await next();
};
