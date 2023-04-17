const db = require('../libs/db');
const mapper = require('../mappers/position.mapper');
const config = require('../config');

module.exports.get = async (ctx) => {
  const card = await _getCard(ctx.params.id);
  if (!card) {
    ctx.throw(404, 'card not found');
  }
  ctx.status = 200;
  ctx.body = mapper(card);
};

module.exports.getCards = async (ctx) => {
  const cards = await _getAllCards(ctx.query.limit, ctx.query.offset);
  ctx.status = 200;
  ctx.body = cards.map((card) => mapper(card));
};

async function _getCard(id) {
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
      case 
        when M.createdat < NOW() - interval '${config.search.ttl}' then 0
        else (M.price*(1+M.profit/100)) end
        as settlement_price,
      B.amount as amount_bovid,
      case 
        when M.createdat < NOW() - interval '${config.search.ttl}' then 0
        else P.amount end
        as amount,
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
    where M.createdat = (
        select max(createdat) from prices p3
        where M.position_id=p3.position_id
      ) 
      AND P.id = $1
    LIMIT 1
  `, [id])
    .then((res) => res.rows[0]);
}

async function _getAllCards(limit, offset) {
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
      case 
        when M.createdat < NOW() - interval '${config.search.ttl}' then 0
        else (M.price*(1+M.profit/100)) end
        as settlement_price,
      B.amount as amount_bovid,
      case 
        when M.createdat < NOW() - interval '${config.search.ttl}' then 0
        else P.amount end
        as amount,
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
    where M.createdat = (
        select max(createdat) from prices p3
        where M.position_id=p3.position_id
      )
    ORDER BY P.id DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
    .then((res) => res.rows);
}
