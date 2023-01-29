module.exports = async (ctx, next) => {
  const brandId = parseInt(ctx.request?.body?.brandId, 10);
  if (!brandId) {
    ctx.throw(400, 'brand not found');
  }
  ctx.request.body.brandId = brandId;

  const providerId = parseInt(ctx.request?.body?.providerId, 10);
  if (!providerId) {
    ctx.throw(400, 'provider not found');
  }
  ctx.request.body.providerId = providerId;

  ctx.request.body.profit = parseInt(ctx.request?.body?.profit, 10) || 0;

  await next();
};
