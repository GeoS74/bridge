module.exports.params = async (ctx, next) => {
  const brandId = parseInt(ctx.request?.body?.brandId, 10);
  if (!brandId) {
    _deleteFile(ctx.request.files);
    ctx.throw(404, 'brand not found');
  }
  ctx.request.body.brandId = brandId;

  const providerId = parseInt(ctx.request?.body?.providerId, 10);
  if (!providerId) {
    _deleteFile(ctx.request.files);
    ctx.throw(404, 'provider not found');
  }
  ctx.request.body.providerId = providerId;

  await next();
};
