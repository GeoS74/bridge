module.exports.params = async (ctx, next) => {
  if(!ctx.request.body?.json_data) {
    ctx.throw(400, 'data is empty');
  }
  await next();
};