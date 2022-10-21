module.exports.upload = async (ctx, next) => {
  try{
    ctx.positions = JSON.parse(ctx.request.body.json_data);
    console.log(ctx.positions)
  } catch(error){
    ctx.throw(400, 'bad json')
  }
  ctx.body = {}
  // await next();
};