module.exports.title = async (ctx, next) => {
  const title = ctx.request?.body?.title?.trim();
  if (!title) {
    ctx.throw(400, 'incorrect title');
  }
  ctx.request.body.title = title;
  await next();
};

module.exports.id = async (ctx, next) => {
  const id = parseInt(ctx.params.id, 10);
  if (!id) {
    ctx.throw(404, 'brand not found');
  }
  ctx.params.id = id;
  await next();
};
