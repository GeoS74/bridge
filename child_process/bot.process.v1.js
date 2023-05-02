/**
 * процесс получает переменные окружения:
 * start
 * end
 * providerId
 * brandId
 * brandTitle
 * profit
 *
 */

const fetch = require('node-fetch');

const logger = require('../libs/logger');
const { parserEng, parserRus, parserGlue } = require('../libs/article.parser');
const { convStringToReal } = require('../libs/price.handler');
const db = require('../libs/db');
const config = require('../config');

class Bot {
  _numberOfPages;

  _start;

  _end;

  _providerId;

  _brandId;

  _brandTitle;

  _profit;

  constructor({
    start, end, providerId, brandId, brandTitle, profit,
  }) {
    this._start = +start;
    this._end = +end;
    this._providerId = providerId;
    this._brandId = brandId;
    this._brandTitle = brandTitle;
    this._profit = profit;
    this._numberOfPages = this.makeNumberOfPages();

    // process.on('message', message => {
    //     this._parentSay(message)
    // });
    process.send(`bot ${process.pid} started. Pages ${this._start} in ${this._end}`);
    this._main();
  }

  makeNumberOfPages() {
    const result = [];
    for (let i = this._start; i <= this._end; i += 1) {
      result.push(i);
    }
    return result;
  }

  async _main() {
    for (const numPage of this._numberOfPages) {
      const start = Date.now();

      const page = await this._readPage(numPage);

      if (page) {
        const positions = Bot._readPositions(page?.response?.items);
        await this._writer(positions);
      }

      process.send(`bot ${process.pid} processed page ${numPage} in ${this._end}, time ${(Date.now() - start) / 1000} sec`);
    }

    process.send(`bot ${process.pid} finished. Pages ${this._start} in ${this._end}`);
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

        await Bot._insertPrice(pos.id, data.price, this._profit);
      } catch (error) {
        // ошибочные ситуации не логируются в дочернем процессе
      }
    }
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

  async _readPage(numPage) {
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
      .catch((error) => {
        this._numberOfPages.push(numPage);
        logger.error(`status: ${error.message} Bad url = ${config.api.voshod.uri}/?a=1&page=${numPage}`);
        return {};
      });
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

  // _parentSay(message) {
  //     switch (message) {
  //         case 'kill': process.exit();
  //         default: this._getState();
  //     }
  // }
}

(() => new Bot(process.env))();
