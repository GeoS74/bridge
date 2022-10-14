const articleConv = require('../libs/article.converter');
const db = require('../libs/db');

module.exports.add = async (ctx) => {
  const { brandId, providerId } = ctx.request.body;

  for (const position of ctx.positions) {
    const data = await _makeData(Object.values(position), brandId, providerId);
    const newPosition = await _insertPosition(Object.values(data).slice(0, 6));
    await _insertPrice(newPosition.id, data.price);
  }

  ctx.status = 200;
  ctx.body = {
    message: 'file upload',
  };
};

async function _makeData(row, brandId, providerId) {
  const articleParse = articleConv(row[1]);
  return {
    bovidId: await _getBovidId(articleParse) || null,
    brandId,
    providerId,
    article: row[1],
    title: row[2],
    articleParse,
    price: row[3],
  };
}

function _getBovidId(articleParse) {
  return db.query(`SELECT id FROM bovid
    WHERE article_parse=$1
  `, [articleParse])
    .then((res) => res.rows[0]);
}

function _insertPosition(data) {
  return db.query(`INSERT INTO positions
    (bovid_id, brand_id, provider_id, article, title, article_parse)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, data)
    .then((res) => res.rows[0]);
}

function _insertPrice(positionId, price) {
  return db.query(`INSERT INTO prices
  (position_id, price)
  VALUES ($1, $2)
  `, [positionId, price]);
}
