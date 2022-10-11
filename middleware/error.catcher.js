const logger = require('../libs/logger');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error.status) {
      ctx.status = error.status;
      ctx.body = {
        error: error.message,
      };
      return;
    }

    logger.error(error.message);
    ctx.status = 500;
    ctx.body = {
      error: 'internal server error',
    };
  }
};
