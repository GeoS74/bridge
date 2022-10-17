const articleConv = require('../libs/article.converter');
const db = require('../libs/db');

module.exports.addBovid = async (ctx) => {
  const start = Date.now();

  let i = 0;
  for (const position of ctx.positions) {
    i++;
    if (!(i % 100)) {
      console.log(`writed: ${i}`);
      console.log(process.memoryUsage().heapUsed);
    }

    const data = await _makeDataBovid(Object.values(position));

    if (data.articleParse) {
      const pos = await _updatePositionBovid(data);

      if (!pos) {
        await _insertPositionBovid(data);
      }
    }
  }

  ctx.status = 200;
  ctx.body = {
    message: 'bovid nomenclature upload',
    time: (Date.now() - start) / 1000,
  };
};

async function _makeDataBovid(row) {
  const articleParse = articleConv(row[1]);
  return {
    code: row[0],
    article: row[1],
    title: row[2],
    amount: row[3] || null,
    articleParse,
  };
}

function _updatePositionBovid(data) {
  return db.query(`UPDATE bovid
  SET
    updatedat=DEFAULT,
    amount=$1
  WHERE code=$2
  RETURNING *
  `, [data.amount, data.code])
    .then((res) => res.rows[0]);
}

function _insertPositionBovid(data) {
  return db.query(`INSERT INTO bovid
    (code, article, title, amount, article_parse)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [data.code, data.article, data.title, data.amount, data.articleParse])
    .then((res) => res.rows[0]).catch((error) => {
      console.log(error);
      throw error;
    });
}

module.exports.add = async (ctx) => {
  const { brandId, providerId } = ctx.request.body;
  const start = Date.now();

  let i = 0;
  for (const position of ctx.positions) {
    i++;
    if (!(i % 100)) {
      console.log(`writed: ${i}`);
      console.log(process.memoryUsage().heapUsed);
    }

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
    .then((res) => res.rows[0]?.id);
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
