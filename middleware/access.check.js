const jwt = require('jsonwebtoken');

const config = require('../config');

module.exports = async (ctx, next) => {
  if (!config.jwt.check) {
    await next();
    return;
  }

  try {
    const token = ctx.get('Authorization').split(' ')[1];

    console.log(process.env.JWT_SECRET_KEY)
  console.log(config.jwt.secretKey)
  console.log(jwt.verify(token, config.jwt.secretKey))


    ctx.user = _jwtDecode(token).user;
  } catch (error) {
    console.log(error.message)
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.throw(401, 'invalid access token');
  }
  await next();
};

function _jwtDecode(token) {
  jwt.verify(token, config.jwt.secretKey);
  return jwt.decode(token);
}
