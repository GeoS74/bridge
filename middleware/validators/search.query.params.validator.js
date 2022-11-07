module.exports = async (ctx, next) => {
  const query = ctx.query.query
    .toString()
    .toLowerCase()
    .trim()
    .match(/[a-zа-я\d]+/g) || [];

  if (!query.length) {
    ctx.throw(404, 'position not a found');
  }

  ctx.query.limit = parseInt(ctx.query?.limit, 10) || 10;
  if (ctx.query.limit > 10) {
    ctx.query.limit = 10;
  }
  ctx.query.offset = parseInt(ctx.query?.offset, 10) || 0;

  await next();
};
