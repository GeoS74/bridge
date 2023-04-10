const db = require('../libs/db');
const logger = require('../libs/logger');
const { parserRus, parserGlue } = require('../libs/article.parser');
const mapper = require('../mappers/position.mapper');
const config = require('../config');

module.exports.search = async (ctx) => {
  try {
    const start = Date.now();
    const {
      query, /* offset, */ limit, liastId,
    } = ctx.query;

    let responseFullText = await _fullTextSearch(query, limit, liastId);
    responseFullText = _filterResponsesByRank(responseFullText);

    if (!responseFullText.length
      || responseFullText[0].rank < config.search.minRankForStartGlueSearch
    ) {
      const glueTextSearch = await Promise.any(_makeRequestPool(
        query,
        /* offset, */
        limit,
        liastId,
      ))
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
      /* offset, */
      limit,
    };
  } catch (error) {
    logger.warn(error.message);
    ctx.throw(404, 'positions not found');
  }
};

function _filterResponsesByRank(response) {
  let maxRank = 0;
  return response.filter((e, i) => {
    if (i === 0) {
      maxRank = e.rank;
      return true;
    }
    return ((e.rank * 100) / maxRank) > config.search.minRankFullTextSearch;
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

function _makeRequestPool(query, /* offset, */ limit, liastId) {
  const arr = [];
  for (let i = 0; i < query.length - config.search.minLengthGlueSearchQuery; i += 1) {
    arr.push(_glueTextSearch(query.substring(0, query.length - i), /* offset, */ limit, liastId));
  }
  return arr;
}

function normalize(word) {
  return word.replaceAll(' ', ' | ');
}

function _fullTextSearch(query, /* offset, */ limit, liastId) {
  return db.query(`
    select
      P.id,
      P.createdat,
      P.brand_id,
      R.title as brand_title,
      P.provider_id,
      CONCAT('Склад № ', P.provider_id) as stock,
      P.article,
      P.title,
      ts_rank(rus_article_parse, to_tsquery($1)) as rank,
      case 
        when M.createdat < NOW() - interval '1 second' then 0
        else (M.price*(1+M.profit/100)) end
        as settlement_price,
      B.amount as amount_bovid,
      P.amount as amount,
      B.code,
      B.uid,
      P.manufacturer,
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
      AND P.id > $3
    ORDER BY ts_rank(rus_article_parse, to_tsquery($1)) DESC, id
    LIMIT $2
  `, [normalize(parserRus(query)), limit, +liastId])
    .then((res) => res.rows);
}

function _glueTextSearch(query, /* offset, */ limit, liastId) {
  return new Promise((resolve, reject) => {
    db.query(`
      select
        P.id,
        P.createdat,
        P.brand_id,
        R.title as brand_title,
        P.provider_id,
        CONCAT('Склад № ', P.provider_id) as stock,
        P.article,
        P.title,
        case 
          when M.createdat < NOW() - interval '1 second' then 0
          else (M.price*(1+M.profit/100)) end
          as settlement_price,
        B.amount as amount_bovid,
        P.amount as amount,
        B.code,
        B.uid,
        P.manufacturer,
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
        AND P.id > $3
      order by article DESC, id
      LIMIT $2
  `, [_getGlueStringForLike(query), limit, +liastId])
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
