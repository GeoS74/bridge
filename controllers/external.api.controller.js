const childProcess = require('child_process');
const fetch = require('node-fetch');

const config = require('../config');
const logger = require('../libs/logger');

module.exports = {
  countPages,
  reader,
};

async function countPages(ctx, next) {
  ctx.countPages = await fetch(`${config.api.voshod.uri}/?a=1`, {
    headers: {
      'X-Voshod-API-KEY': config.api.voshod.key,
    },
  })
    .then(async (response) => {
      if (response.ok) {
        const res = await response.json();
        return res.response.page.pages;
      }

      throw new Error(response.status);
    })
    .catch((error) => {
      logger.error(`API возвращает статус: ${error.message}`);
      return 0;
    });

  await next();
}

async function reader(ctx) {
  const providerId = 83;
  const brandId = 78;
  const brandTitle = 'Ваз, Газ, Иномарки';
  const profit = 20;
  const countBots = 8;

  for (let i = 0, step = Math.ceil(ctx.countPages / countBots); i < ctx.countPages; i += step) {
    const start = i + 1;
    const end = i + step > ctx.countPages ? ctx.countPages : i + step;

    _createBot(start, end, providerId, brandId, brandTitle, profit);
  }

  ctx.status = 200;
  ctx.body = {};
}

function _createBot(start, end, providerId, brandId, brandTitle, profit) {
  const bot = childProcess.fork('./child_process/bot.process', [], {
    env: {
      start, end, providerId, brandId, brandTitle, profit,
    },
  });

  bot.on('message', (message) => {
    logger.info(`bot send: ${message}`);
  });

  return bot;
}
