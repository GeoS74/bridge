const db = require('../libs/db');
const logger = require('../libs/logger');
const { parserEng, parserRus } = require('../libs/article.parser');

module.exports.search = async (ctx) => {
  try {
    ctx.status = 200;
    ctx.body = await _getPositions(ctx.query.query);
  } catch (error) {
    logger.error(error.message);
    ctx.throw(404, 'positions not found');
  }
};

function normalize(word) {
  return word.replaceAll(' ', ' | ');
}

function _getPositions(text) {
  return db.query(`
  select 
    article,
    title,
    ts_rank(to_tsvector(rus_article_parse), to_tsquery($1)) as rank
  from positions
  where to_tsvector(rus_article_parse) @@ to_tsquery($1)
  ORDER BY ts_rank(to_tsvector(rus_article_parse), to_tsquery($1)) DESC
  limit 10
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
