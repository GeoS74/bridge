/**
 * процесс получает переменные окружения:
 *
 * providerId
 * brandId
 * brandTitle
 * profit
 * id
 * numPage
 */

const fetch = require('node-fetch');

const { parserEng, parserRus, parserGlue } = require('../libs/article.parser');
const { convStringToReal } = require('../libs/price.handler');
const db = require('../libs/db');
const config = require('../config');

class Bot {
  _id;

  _posId;

  _article;

  _title;

  _manufacturer;

  constructor({
    id, posId, article, title, manufacturer,
  }) {
    this._id = id;
    this._posId = posId;
    this._article = article;
    this._title = title;
    this._manufacturer = manufacturer;
    this._start();
  }

  async _start() {
    const start = Date.now();

    const page = await Bot._readPage(this._article, this._title);

    if (page === 'The user aborted a request.') {
      const answer = {
        error: 'aborting',
        id: this._id,
        time: (Date.now() - start) / 1000,
        article: this._article,
      };

      process.send(JSON.stringify(answer));
      process.exit();
    }

    if (!page?.response?.items) {
      const answer = {
        error: `status ${page}`,
        id: this._id,
        time: (Date.now() - start) / 1000,
        article: this._article,
      };

      process.send(JSON.stringify(answer));
      process.exit();
    }

    const positions = Bot._readPositions(page?.response?.items);
    await this._writer(positions);

    const answer = {
      id: this._id,
      time: (Date.now() - start) / 1000,
    };

    process.send(JSON.stringify(answer));
    process.exit();
  }

  _makeData(data) {
    const fullTitle = `${Bot._makeString(data.article)} ${Bot._makeString(data.title)} ${Bot._makeString(this._brandTitle)} ${Bot._makeString(data.manufacturer)}`;
    return {
      uid: null,
      code: null,
      article: data.article || null,
      title: data.title || null,
      weight: 0,
      width: 0,
      height: 0,
      length: 0,
      manufacturer: data.manufacturer || null,
      storage: JSON.stringify({}),
      price: convStringToReal(data.price),
      amount: convStringToReal(data.amount),
      engArticleParse: parserEng(data.article) || null,
      engFullTitleParse: parserEng(fullTitle.trim()) || null,
      rusFullTitleParse: parserRus(fullTitle.trim()) || null,
      glueArticleParse: parserGlue(fullTitle.trim()) || null,
    };
  }

  async _writer(positions) {
    for (const position of positions) {
      const data = this._makeData(position);

      try {
        if (!data.article && !data.title) {
          throw new Error('позиция без артикула и наименования');
        }
        if (data.article !== this._article) {
          throw new Error('не совпадает артикул');
        }
        if (data.title !== this._title) {
          throw new Error('не совпадает артикул');
        }
        if (data.manufacturer !== this._manufacturer) {
          throw new Error('позиция другого производителя');
        }

        const pos = await Bot._updatePosition(data, this._posId);

        await Bot._insertPrice(pos.id, data.price, Bot._progressiveProfit(data.price));
        break;
      } catch (error) {
        // ошибочные ситуации не логируются в дочернем процессе
      }
    }
  }

  static _progressiveProfit(price) {
    if (price < 100) {
      return 100;
    }
    if (price < 300) {
      return 80;
    }
    if (price < 500) {
      return 50;
    }
    if (price < 1000) {
      return 30;
    }
    return 12;
  }

  static _checkUnitCode(code) {
    return code === 796;
  }

  static _readPositions(items) {
    if (!items) {
      return [];
    }

    const result = [];

    for (const position of items) {
      if (position.count_chel) {
        if (Bot._checkUnitCode(position.unit_code)) {
          result.push({
            article: position.oem_num,
            title: position.name,
            amount: position.count_chel,
            manufacturer: position.oem_brand,
            price: position.price,
          });
        }
      }
    }
    return result;
  }

  static makeUrl(article, title) {
    const url = new URL(`${config.api.voshod.uri}/search/name`);
    url.searchParams.set('a', '1');
    url.searchParams.set('q', `${article} ${title}`);
    return url;
  }

  static async _readPage(article, title) {
    const controller = new AbortController();

    setTimeout(() => controller.abort(), 2000);

    return fetch(Bot.makeUrl(article, title), {
      headers: { 'X-Voshod-API-KEY': config.api.voshod.key },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.ok) {
          const res = await response.json();
          return res;
        }

        throw new Error(response.status);
      })
      .catch((error) => error.message);
  }

  static async _updatePosition(data, posId) {
    return db.query(`UPDATE positions
          SET
            updatedat=DEFAULT,
            amount=$1
          WHERE id=$2
          RETURNING *
          `, [
      data.amount,
      posId,
    ])
      .then((res) => res.rows[0]);
  }

  static async _insertPrice(positionId, price, profit) {
    return db.query(`INSERT INTO prices
          (position_id, price, profit)
          VALUES ($1, $2, $3)
          `, [positionId, price, profit]);
  }

  static _makeString(str) {
    return str?.toString()?.trim() || '';
  }
}

(() => new Bot(process.env))();
