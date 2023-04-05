const db = require('../libs/db');
const logger = require('../libs/logger');
const { parserRus, parserGlue } = require('../libs/article.parser');
const mapper = require('../mappers/position.mapper');
const config = require('../config');

module.exports.search = async (ctx) => {
  try {
    const start = Date.now();
    const {
      query, offset, limit, liastId,
    } = ctx.query;

    let responseFullText = await _fullTextSearch(query, offset, limit, liastId);
    responseFullText = _filterResponsesByRank(responseFullText, config.minRankFullTextSearch);

    if (!responseFullText.length || responseFullText[0].rank < config.minRankForStartGlueSearch) {
      const glueTextSearch = await Promise.any(_makeRequestPool(query, offset, limit, liastId))
        .catch(() => []);

      responseFullText = responseFullText.concat(glueTextSearch);
    }

    responseFullText = _cleanDublicatePositionById(responseFullText);
    if (!responseFullText.length) {
      throw new Error(`positions "${query}" not found`);
    }

    ctx.status = 200;
    ctx.body = {
      positions: responseFullText.map((position) => mapper(position)),
      time: (Date.now() - start) / 1000,
      offset,
      limit,
    };
  } catch (error) {
    logger.error(error.message);
    ctx.throw(404, 'positions not found');
  }
};

function _filterResponsesByRank(response, ratio) {
  let maxRank = 0;
  return response.filter((e, i) => {
    if (i === 0) {
      maxRank = e.rank * 1000;
      return true;
    }
    return ((e.rank * 1000 * 100) / maxRank) > ratio;
  });
}

function _cleanDublicatePositionById(response) {
  const result = [];
  response.forEach((v) => {
    const dublicate = result.find((elem) => elem.id === v.id);

    if (!dublicate) {
      result.push(v);
    }
  });
  return result;
}

function _getGlueStringForLike(str) {
  return `%${parserGlue(str)}%`;
}

function _makeRequestPool(query, offset, limit, liastId) {
  const arr = [];
  for (let i = 0; i < query.length - config.minLengthGleuSearchQuery; i += 1) {
    arr.push(_glueTextSearch(query.substring(0, query.length - i), offset, limit, liastId));
  }
  return arr;
}

function normalize(word) {
  return word.replaceAll(' ', ' | ');
}

function _fullTextSearch(query, offset, limit, liastId) {
  return db.query(`
    select
      P.id,
      P.createdat,
      P.brand_id,
      R.title as brand_title,
      P.provider_id,
      V.title as provider_title,
      P.article,
      P.title,
      ts_rank(rus_article_parse, to_tsquery($1)) as rank,
      M.price,
      (M.price*(1+M.profit/100)) as settlement_price,
      B.amount as amount_bovid,
      P.amount as amount,
      B.code,
      B.uid,
      B.manufacturer,
      B.storage,
      B.weight,
      B.width,
      B.length,
      B.storage
    from positions P
    join prices M
      on P.id=M.position_id
    left join bovid B
      on B.id=P.bovid_id
    join brands R
      on P.brand_id=R.id
    join providers V
      on P.provider_id=V.id
    where rus_article_parse @@ to_tsquery($1) AND
      M.createdat = (
        select max(createdat) from prices p3
        where M.position_id=p3.position_id
      ) 
      AND P.id > $4
    ORDER BY ts_rank(rus_article_parse, to_tsquery($1)) DESC, id
    OFFSET $2 LIMIT $3
  `, [normalize(parserRus(query)), offset, limit, +liastId])
    .then((res) => res.rows);
}

function _glueTextSearch(query, offset, limit, liastId) {
  return new Promise((resolve, reject) => {
    db.query(`
      select
        P.id,
        P.createdat,
        P.brand_id,
        R.title as brand_title,
        P.provider_id,
        V.title as provider_title,
        P.article,
        P.title,
        M.price,
        (M.price*(1+M.profit/100)) as settlement_price,
        B.amount as amount_bovid,
        P.amount as amount,
        B.code,
        B.uid,
        B.manufacturer,
        B.storage,
        B.weight,
        B.width,
        B.length,
        B.storage
      from positions P
      join prices M
        on P.id=M.position_id
      left join bovid B
        on B.id=P.bovid_id
      join brands R
        on P.brand_id=R.id
      join providers V
        on P.provider_id=V.id
      where glue_article_parse like $1 AND
        M.createdat = (
          select max(createdat) from prices p3
          where M.position_id=p3.position_id
        ) 
        AND P.id > $4
      order by article DESC, id
      OFFSET $2 LIMIT $3
  `, [_getGlueStringForLike(query), offset, limit, +liastId])
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows);
          return;
        }
        reject();
      })
      .catch((error) => {
        // ошибка проброшенная отсюда с помощью throw ломает приложение,
        // чтобы не потерять ошибки запросов к БД они логируются здесь
        logger.error(error.message);
        reject();
      });
  });
}
