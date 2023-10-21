const fs = require('fs/promises');
const sharp = require('sharp');

const logger = require('../libs/logger');
const db = require('../libs/db');
const mapper = require('../mappers/position.mapper');
const config = require('../config');

module.exports.getByAlias = async (ctx) => {
  const card = await _getCardByAlias(ctx.params.alias);
  if (!card) {
    ctx.throw(404, 'card not found');
  }
  ctx.status = 200;
  ctx.body = mapper(card);
};

async function _getCardByAlias(alias) {
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
      P.photo,
      P.alias,
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
      AND P.alias = $1
    LIMIT 1
  `, [alias])
    .then((res) => res.rows[0]);
}

module.exports.get = async (ctx) => {
  const card = await _getCard(ctx.params.id);
  if (!card) {
    ctx.throw(404, 'card not found');
  }
  ctx.status = 200;
  ctx.body = mapper(card);
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
      P.photo,
      P.alias,
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

module.exports.photo = async (ctx) => {
  let card = await _getCard(ctx.params.id);

  if (!card) {
    _deleteFile(ctx.photo.filepath);
    ctx.throw(404, 'card not found');
  }

  /* delete old photo */
  if (card.photo) {
    _deleteFile(`./files/photo/${card.photo}`);
  }

  /* change size photo */
  await _processingPhoto(ctx.photo)
    .catch((error) => ctx.throw(400, `error resizing photo: ${error.message}`));

  _deleteFile(ctx.photo.filepath);

  card = await _updatePhoto(ctx.params.id, JSON.stringify([ctx.photo.newFilename]));

  ctx.status = 200;
  ctx.body = mapper(card);
};

function _deleteFile(fpath) {
  fs.unlink(fpath)
    .catch((error) => logger.error(`delete file: ${error.message}`));
}

function _updatePhoto(id, photo) {
  return db.query(`UPDATE positions 
    SET
      photo=$2
    WHERE id=$1
    RETURNING *
    `, [id, photo])
    .then((res) => res.rows[0]);
}

function _processingPhoto({ filepath, newFilename }) {
  return sharp(filepath)
    .resize({
      width: 500,
      // height: 500,
    })
    .toFile(`./files/photo/${newFilename}`);
}

module.exports.getCards = async (ctx) => {
  const cards = await _getAllCards(ctx.query.limit, ctx.query.offset);
  ctx.status = 200;
  ctx.body = cards.map((card) => mapper(card));
};

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
      P.photo,
      P.alias,
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

module.exports.getCountCards = async (ctx) => {
  const count = await _getCountCards();
  ctx.status = 200;
  ctx.body = { count: +count };
};

async function _getCountCards() {
  return db.query(`
    select count(*) as count from positions`)
    .then((res) => res.rows[0].count);
}
