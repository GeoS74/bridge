const articleParser = require('../libs/article.parser');
const db = require('../libs/db');
const logger = require('../libs/logger');

module.exports.addBovid = async (ctx) => {
  const start = Date.now();

  for (const position of ctx.positions) {
    const data = _makeData(position, ctx.structure);

    if (data.articleParse) {
      const pos = data.uid
        ? await _updatePositionBovidByUID(data)
        : await _updatePositionBovidByCode(data);

      if (!pos) {
        await _insertPositionBovid(data);
      }
    }
  }

  logger.info('upload positions complete', (Date.now() - start) / 1000);

  ctx.status = 200;
  ctx.body = {
    message: 'upload positions complete',
  };
};

function _updatePositionBovidByUID(data) {
  return db.query(`UPDATE bovid
  SET
    updatedat=DEFAULT,
    article=$2,
    article_parse=$3,
    title=$4,
    amount=$5,
    storage=$6,
    weight=$7,
    width=$8,
    height=$9,
    length=$10,
    manufacturer=$11
  WHERE uid=$1
  RETURNING *
  `, [
    data.uid,
    data.article,
    data.articleParse,
    data.title,
    data.amount,
    data.storage,
    data.weight,
    data.width,
    data.height,
    data.length,
    data.manufacturer,
  ])
    .then((res) => res.rows[0])
    .catch((error) => logger.error(`код ${data.code} артикул ${data.article}`, error.message));
}

function _updatePositionBovidByCode(data) {
  return db.query(`UPDATE bovid
  SET
    updatedat=DEFAULT,
    article=$2,
    article_parse=$3,
    title=$4,
    amount=$5,
    storage=$6,
    weight=$7,
    width=$8,
    height=$9,
    length=$10,
    manufacturer=$11
  WHERE code=$1
  RETURNING *
  `, [
    data.code,
    data.article,
    data.articleParse,
    data.title,
    data.amount,
    data.storage,
    data.weight,
    data.width,
    data.height,
    data.length,
    data.manufacturer,
  ])
    .then((res) => res.rows[0])
    .catch((error) => logger.error(`код ${data.code} артикул ${data.article}`, error.message));
}

function _insertPositionBovid(data) {
  return db.query(`INSERT INTO bovid
    (
      uid, 
      code,
      article, 
      article_parse, 
      title, 
      amount, 
      storage,
      weight,
      width,
      height,
      length,
      manufacturer
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    data.uid,
    data.code,
    data.article,
    data.articleParse,
    data.title,
    data.amount,
    data.storage,
    data.weight,
    data.width,
    data.height,
    data.length,
    data.manufacturer,
  ])
    .then((res) => res.rows[0])
    .catch((error) => logger.error(`код ${data.code} артикул ${data.article}`, error.message));
}

function _sumAmount(storages) {
  let amount = 0;
  if (storages && Array.isArray(storages)) {
    for (const storage of storages) {
      amount += +storage.amount;
    }
  }
  return amount;
}

function _checkStorage(storage) {
  if (storage && Array.isArray(storage)) {
    return storage.filter((s) => +s.amount >= 0);
  }
  return [];
}

function _makeData(data, structure) {
  const storage = _checkStorage(data[structure.storage]);
  return {
    uid: data[structure.uid] || null,
    code: data[structure.code] || null,
    article: data[structure.article] || null,
    title: data[structure.title] || null,
    weight: data[structure.weight] || null,
    width: data[structure.width] || null,
    height: data[structure.height] || null,
    length: data[structure.length] || null,
    manufacturer: data[structure.manufacturer] || null,
    storage: JSON.stringify(storage),
    price: data[structure.price] || null,
    amount: _sumAmount(storage),
    articleParse: articleParser(data[structure.article]) || null,
    titleParse: articleParser(data[structure.title]) || null,
  };
}

module.exports.add = async (ctx) => {
  const { brandId, providerId } = ctx.request.body;
  const start = Date.now();

  let i = 0;
  for (const position of ctx.positions) {
    i += 1;
    if (!(i % 100)) {
      console.log(`writed: ${i}`);
      console.log(process.memoryUsage().heapUsed);
    }

    const data = await _makeData_(Object.values(position), brandId, providerId);

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

async function _makeData_(row, brandId, providerId) {
  // const articleParse = articleConv(row[1]);
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
