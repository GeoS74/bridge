const db = require('../libs/db');
const logger = require('../libs/logger');
const { parserEng, parserRus, parserGlue } = require('../libs/article.parser');

module.exports.search = async (ctx) => {
  try {
    ctx.status = 200;

    let maxRank = 0;
    let arr = await _getPositions(ctx.query.query);

    if (!arr.length || arr[0].rank < 0.04) {
      // step
      let arr_1 = [];
      // arr_1 = await _getPositionsStep2(ctx.query.query);
      // arr_1 = arr_1.filter((v, i) => {
      //   if (i === 0) {
      //     maxRank = v.rank * 1000;
      //     return true;
      //   }
      //   return (v.rank * 1000 * 100 / maxRank) > 79.9;
      // });

      // step
      const pr = await Promise.all(makePromise(ctx.query.query));
      let arr_2 = [];
      for (let i = 0; i < pr.length; i++) {
        if (pr[i].length) {
          arr_2 = pr[i];
          break;
        }
      }

      arr = arr_2.concat(arr, arr_1);
    }

    ctx.body = arr;
  } catch (error) {
    logger.error(error.message);
    ctx.throw(404, 'positions not found');
  }
};

function makePromise(query) {
  const arr = [];
  for (let i = 0; i < query.length - 6; i++) {
    const str = `%${parserGlue(query.substring(0, query.length - i))}%`;
    arr.push(db.query(`
    select
      P.article,
      P.title,
      M.price,
      B.amount as amount_bovid,
      P.amount as amount,
      B.code, 
      R.title as brand
    from positions P
    join prices M
      on P.id=M.position_id
    left join bovid B
      on B.id=P.bovid_id
    join brands R
      on P.brand_id=R.id
    where glue_article_parse like $1 AND
      M.createdat = (
        select max(createdat) from prices p3
        where M.position_id=p3.position_id
      ) 
    limit 5
    `, [str]).then((res) => res.rows));
  }
  return arr;
}

function normalize(word) {
  return word.replaceAll(' ', ' | ');
}

function _getPositionsStep2(text) {
  return db.query(`
  select 
    P.article,
    P.title,
    ts_rank(to_tsvector(P.eng_article_parse), to_tsquery($1)) as rank,
    M.price,
    B.amount as amount_bovid,
    P.amount as amount,
    B.code, 
    R.title as brand
  from positions P
  join prices M
    on P.id=M.position_id
  left join bovid B
    on B.id=P.bovid_id
  join brands R
    on P.brand_id=R.id
  where to_tsvector(P.eng_article_parse) @@ to_tsquery($1) AND
    M.createdat = (
      select max(createdat) from prices p3
      where M.position_id=p3.position_id
    ) 
  ORDER BY ts_rank(to_tsvector(P.eng_article_parse), to_tsquery($1)) DESC
  limit 10
  `, [normalize(parserEng(text))])
    .then((res) => res.rows);
}

function _getPositions(text) {
  return db.query(`
  select 
    P.article,
    P.title,
    ts_rank(to_tsvector(rus_article_parse), to_tsquery($1)) as rank,
    M.price,
    B.amount as amount_bovid,
    P.amount as amount,
    B.code, 
    R.title as brand
  from positions P
  join prices M
    on P.id=M.position_id
  left join bovid B
    on B.id=P.bovid_id
  join brands R
    on P.brand_id=R.id
  where to_tsvector(rus_article_parse) @@ to_tsquery($1) AND
    M.createdat = (
      select max(createdat) from prices p3
      where M.position_id=p3.position_id
    ) 
  ORDER BY ts_rank(to_tsvector(rus_article_parse), to_tsquery($1)) DESC
  limit 100
  offset 20
  `, [normalize(parserRus(text))])
    .then((res) => res.rows);
}

function _getPositions__(text) {
  return db.query(`
  select 
    p1.bovid_id, 
    R.title as brand, 
    V.title as provider, 
    B.code, 
    B.article as b_article, 
    p1.article, 
    p1.title,
    B.amount as ut_amount, 
    p1.amount as pos_amount, 
    M.price,
    M.createdat
  from positions p1
  join prices M
    on p1.id=M.position_id
  left join bovid B
    on B.id=p1.bovid_id
  join brands R
    on p1.brand_id=R.id
  join providers V
    on p1.provider_id=V.id
  where M.createdat = (
    select max(createdat) from prices p3
    where M.position_id=p3.position_id
  ) 
    and p1.bovid_id is not null 
    and B.amount != 0
    and p1.brand_id=1 and provider_id=1
  offset 0 limit 10;
  `)
    .then((res) => res.rows);
}
