module.exports.id = async (ctx, next) => {
  const id = parseInt(ctx.params.id, 10);
  if (!id) {
    ctx.throw(404, 'card not found');
  }
  ctx.params.id = id;
  await next();
};

module.exports.param = async (ctx, next) => {
  ctx.query.limit = parseInt(ctx.query?.limit, 10) || 10;
  if (ctx.query.limit > 150) {
    ctx.query.limit = 150;
  }
  ctx.query.offset = parseInt(ctx.query?.offset, 10) || 0;
  await next();
};
