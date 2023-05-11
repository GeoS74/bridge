const childProcess = require('child_process');
const fetch = require('node-fetch');

const config = require('../config');
const logger = require('../libs/logger');
const { delay } = require('../libs/myfunc');

module.exports = {
  countPages,
  readerV1,
  readerV2,
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

/**
 * v1
 * reader получает кол-во страниц для опроса
 * делит их примерно поровну среди ботов и запускает их
 *
 * бот опрашивает свой пул страниц,
 * при этом если при запросе страницы сервер возвращает ошибку,
 * бот ставит эту страницу в конец очереди и
 * после завершения опроса бот возвращается к проблемной странице
 */

async function readerV1(ctx) {
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
  const bot = childProcess.fork('./child_process/bot.process.v1', [], {
    env: {
      start, end, providerId, brandId, brandTitle, profit,
    },
  });

  bot.on('message', (message) => {
    logger.info(`bot send: ${message}`);
  });

  return bot;
}

/**
 * v2
 *
 * используется глобальная переменная
 *
 * reader получает кол-во страниц для опроса и
 * создаёт нужное кол-во ботов
 *
 * бот (дочерний процесс) получает за один вызов только одну страницу
 * после обработки сообщает родительскому процессу и завершает свой процесс
 * первый освободившийся бот получает следующую страницу
 *
 * работает быстрее чем readerV1
 */

let numPage = 1;

async function readerV2(ctx) {
  const providerId = 83;
  const brandId = 78;
  const brandTitle = 'Ваз, Газ, Иномарки';
  const profit = 20;
  const countBots = 14;
  numPage = 0;

  logger.info('request to API Voshod started');

  for (let i = 1; i <= countBots; i += 1) {
    await delay(1000);
    logger.info(`bot ${i} started`);
    _createProcessV2(i, providerId, brandId, brandTitle, profit, ctx.countPages);
  }

  ctx.status = 200;
  ctx.body = 'all bots started';
}

function _createProcessV2(id, providerId, brandId, brandTitle, profit, maxPages) {
  numPage += 1;

  const bot = childProcess.fork('./child_process/bot.process.v2', [], {
    env: {
      id, numPage, providerId, brandId, brandTitle, profit,
    },
  });

  bot.on('message', (message) => {
    const mess = JSON.parse(message);

    if (mess.error) {
      logger.error(`bot ${mess.id} error page: ${mess.numPage}`);
    } else {
      logger.info(`bot ${mess.id} processed page: ${mess.numPage} at ${mess.time} sec`);
    }

    if (numPage <= maxPages) {
      _createProcessV2(id, providerId, brandId, brandTitle, profit, maxPages);
    } else {
      logger.info(`bot ${mess.id} finished`);
    }
  });
}
