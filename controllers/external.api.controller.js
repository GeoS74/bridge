const childProcess = require('child_process');
const fetch = require('node-fetch');

const config = require('../config');
const logger = require('../libs/logger');

module.exports = {
  countPages,
  reader,
  readerNew,
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

let numPage = 1;

async function readerNew(ctx) {
  const providerId = 83;
  const brandId = 78;
  const brandTitle = 'Ваз, Газ, Иномарки';
  const profit = 20;
  const countBots = 15;
  numPage = 1;

  for (let i = 1; i <= countBots; i++) {
    await delay(1000);
    logger.info(`bot ${i} started`);
    _createBotNew(i, providerId, brandId, brandTitle, profit, ctx.countPages);
  }

  ctx.status = 200;
  ctx.body = 'all bots started';
}

function _createBotNew(id, providerId, brandId, brandTitle, profit, maxPages) {
  const bot = childProcess.fork('./child_process/bot.process', [], {
    env: {
      id, numPage, providerId, brandId, brandTitle, profit,
    },
  });

  numPage += 1;

  bot.on('message', (message) => {
    const mess = JSON.parse(message);

    if (mess.error) {
      logger.error(`bot ${mess.id} error page: ${mess.numPage}`);
    }

    logger.info(`bot ${mess.id} processed page: ${mess.numPage} at ${mess.time} sec`);

    if (numPage <= maxPages) {
      _createBotNew(id, providerId, brandId, brandTitle, profit, maxPages);
    }
  });
}

function delay(time) {
  return new Promise((res) => {
    setTimeout(() => res(1), time);
  });
}
