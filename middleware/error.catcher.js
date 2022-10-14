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

    if (error.code) { // ошибки PostgreSQL
      if (error.code === '23503') {
        ctx.status = 400;
        ctx.body = {
          error: 'проверьте правильность идентификатора бренда или поставщика',
        };
        return;
      }
      logger.error(error.detail);
    } else {
      logger.error(error.message);
    }

    ctx.status = 500;
    ctx.body = {
      error: 'internal server error',
    };
  }
};
