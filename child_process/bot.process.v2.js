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

  _numPage;

  _providerId;

  _brandId;

  _brandTitle;

  _profit;

  constructor({
    id, numPage, providerId, brandId, brandTitle, profit,
  }) {
    this._id = id;
    this._numPage = numPage;
    this._providerId = providerId;
    this._brandId = brandId;
    this._brandTitle = brandTitle;
    this._profit = profit;
    this._start();
  }

  async _start() {
    const start = Date.now();

    const page = await Bot._readPage(this._numPage);

    if (!page) {
      const answer = {
        error: 'bad page',
        id: this._id,
        time: (Date.now() - start) / 1000,
        numPage: this._numPage,
      };

      process.send(JSON.stringify(answer));
      process.exit();
    }

    const positions = Bot._readPositions(page?.response?.items);
    await this._writer(positions);

    const answer = {
      id: this._id,
      time: (Date.now() - start) / 1000,
      numPage: this._numPage,
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
        let pos = await Bot._updatePosition(data, this._brandId, this._providerId);

        if (!data.article && !data.title) {
          throw new Error('позиция без артикула и наименования');
        }

        if (!pos) {
          pos = await Bot._insertPosition(data, this._brandId, this._providerId);
        }

        // await Bot._insertPrice(pos.id, data.price, this._profit);
        await Bot._insertPrice(pos.id, data.price, Bot._progressiveProfit(data.price));
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

  static _checkDepartment(department) {
    switch (department.toString().toLowerCase()) {
      case 'иномарки':
      case 'ваз':
      case 'газ': return true;
      default: return false;
    }
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
        if (Bot._checkDepartment(position.department)) {
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
    }
    return result;
  }

  static async _readPage(numPage) {
    return fetch(`${config.api.voshod.uri}/?a=1&page=${numPage}`, {
      headers: { 'X-Voshod-API-KEY': config.api.voshod.key },
    })
      .then(async (response) => {
        if (response.ok) {
          const res = await response.json();
          return res;
        }

        throw new Error(response.status);
      })
      .catch(() => false);
  }

  /**
  * методы без изменения реализации
  */
  static async _updatePosition(data, brandId, providerId) {
    return db.query(`UPDATE positions
          SET
            updatedat=DEFAULT,
            bovid_id=$1,
            article=$2,
            title=$3,
            amount=$4,
            rus_article_parse=to_tsvector('pg_catalog.russian', coalesce($5, ''))
          WHERE eng_article_parse=$6 AND brand_id=$7 AND provider_id=$8
          RETURNING *
          `, [
      data.bovidId,
      data.article,
      data.title,
      data.amount,
      data.rusFullTitleParse,
      data.engFullTitleParse,
      brandId,
      providerId,
    ])
      .then((res) => res.rows[0]);
  }

  static async _insertPosition(data, brandId, providerId) {
    return db.query(`INSERT INTO positions
            (
              brand_id, 
              provider_id, 
              bovid_id, 
              article, 
              title, 
              amount,
              manufacturer,
              rus_article_parse,
              eng_article_parse,
              glue_article_parse
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, to_tsvector('pg_catalog.russian', coalesce($8, '')), $9, $10)
            RETURNING *
          `, [
      brandId,
      providerId,
      data.bovidId,
      data.article,
      data.title,
      data.amount,
      data.manufacturer,
      data.rusFullTitleParse,
      data.engFullTitleParse,
      data.glueArticleParse,
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
