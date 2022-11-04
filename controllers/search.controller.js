const db = require('../libs/db');
const logger = require('../libs/logger');
const { parserRus, parserGlue } = require('../libs/article.parser');
const mapper = require('../mappers/position.mapper');

module.exports.search = async (ctx) => {
  try {
    const start = Date.now();

    let responseFullText = await _fullTextSearch(ctx.query.query);
    responseFullText = _filterResponsesByRank(responseFullText);

    if (!responseFullText.length || responseFullText[0].rank < 0.045) {
      const glueTextSearch = await Promise.any(_makeRequestPool(ctx.query.query))
        .catch(() => []);

      responseFullText = glueTextSearch.concat(responseFullText);
    }

    responseFullText = _cleanDublicatePosition(responseFullText);
    if (!responseFullText.length) {
      throw new Error(`positions "${ctx.query.query}" not found`);
    }

    ctx.status = 200;
    ctx.body = {
      positions: responseFullText.map((position) => mapper(position)),
      time: (Date.now() - start) / 1000,
    };
  } catch (error) {
    logger.error(error.message);
    ctx.throw(404, 'positions not found');
  }
};

function _filterResponsesByRank(response) {
  let maxRank = 0;
  return response.filter((e, i) => {
    if (i === 0) {
      maxRank = e.rank * 1000;
      return true;
    }
    return ((e.rank * 1000 * 100) / maxRank) > 79.9;
  });
}

function _cleanDublicatePosition(response) {
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

function _glueTextSearch(text) {
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
      order by article desc
      limit 10
  `, [_getGlueStringForLike(text)])
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows);
          return;
        }
        reject();
      })
      .catch((error) => {
        // ошибка проброшенная от сюда с помощью throw ломает приложение
        // чтобы не потерять ошибки запросов к БД они логируются здесь
        logger.error(error.message);
        reject();
      });
  });
}

function _makeRequestPool(query) {
  const arr = [];
  for (let i = 0; i < query.length - 6; i += 1) {
    arr.push(_glueTextSearch(query.substring(0, query.length - i)));
  }
  return arr;
}

function normalize(word) {
  return word.replaceAll(' ', ' | ');
}

function _fullTextSearch(text) {
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
      ts_rank(to_tsvector(rus_article_parse), to_tsquery($1)) as rank,
      M.price,
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
    where to_tsvector(rus_article_parse) @@ to_tsquery($1) AND
      M.createdat = (
        select max(createdat) from prices p3
        where M.position_id=p3.position_id
      ) 
    ORDER BY ts_rank(to_tsvector(rus_article_parse), to_tsquery($1)) DESC
    limit 3
  `, [normalize(parserRus(text))])
    .then((res) => res.rows);
}
