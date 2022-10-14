const articleConv = require('../libs/article.converter');
const db = require('../libs/db');

module.exports.add = async (ctx) => {
  const { brandId, providerId } = ctx.request.body;
  const start = Date.now();

  for (const position of ctx.positions) {
    const data = await _makeData(Object.values(position), brandId, providerId);

    if (data.articleParse) {
      let pos = await _updatePosition(data);

      if (!pos) {
        pos = await _insertPosition(data);
      }
      await _insertPrice(pos.id, data.price);
    }
  }

  ctx.status = 200;
  ctx.body = {
    message: 'file upload',
    time: (Date.now() - start) / 1000,
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

function _updatePosition(data) {
  return db.query(`UPDATE positions
  SET
    updatedat=DEFAULT,
    title=$1
  WHERE article_parse=$2 AND brand_id=$3 AND provider_id=$4
  RETURNING *
  `, [data.title, data.articleParse, data.brandId, data.providerId])
    .then((res) => res.rows[0]);
}

function _insertPosition(data) {
  return db.query(`INSERT INTO positions
    (bovid_id, brand_id, provider_id, article, title, article_parse)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [data.bovidId, data.brandId, data.providerId, data.article, data.title, data.articleParse])
    .then((res) => res.rows[0]);
}

function _insertPrice(positionId, price) {
  return db.query(`INSERT INTO prices
  (position_id, price)
  VALUES ($1, $2)
  `, [positionId, price]);
}
