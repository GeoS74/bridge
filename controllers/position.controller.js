const { parserEng, parserRus } = require('../libs/article.parser');
const priceHandler = require('../libs/price.handler');
const db = require('../libs/db');
const logger = require('../libs/logger');

module.exports.addBovid = async (ctx) => {
  const start = Date.now();

  for (const position of ctx.positions) {
    const data = _makeData(position, ctx.structure, 'isBovid');

    try {
      if (data.engArticleParse) {
        const pos = data.uid
          ? await _updatePositionBovidByUID(data)
          : await _updatePositionBovidByCode(data);

        if (!pos) {
          await _insertPositionBovid(data);
        }
      }
    } catch (error) {
      logger.error(`код ${data.code} артикул ${data.article}`, error.message);
    }
  }

  logger.info('upload positions complete', (Date.now() - start) / 1000);

  ctx.status = 200;
  ctx.body = {
    message: `upload positions complete in ${(Date.now() - start) / 1000}`,
  };
};

function _updatePositionBovidByUID(data) {
  return db.query(`UPDATE bovid
  SET
    updatedat=DEFAULT,
    article=$2,
    eng_article_parse=$3,
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
    data.engArticleParse,
    data.title,
    data.amount,
    data.storage,
    data.weight,
    data.width,
    data.height,
    data.length,
    data.manufacturer,
  ])
    .then((res) => res.rows[0]);
}

function _updatePositionBovidByCode(data) {
  return db.query(`UPDATE bovid
  SET
    updatedat=DEFAULT,
    article=$2,
    eng_article_parse=$3,
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
    data.engArticleParse,
    data.title,
    data.amount,
    data.storage,
    data.weight,
    data.width,
    data.height,
    data.length,
    data.manufacturer,
  ])
    .then((res) => res.rows[0]);
}

function _insertPositionBovid(data) {
  return db.query(`INSERT INTO bovid
    (
      uid, 
      code,
      article, 
      eng_article_parse, 
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
    data.engArticleParse,
    data.title,
    data.amount,
    data.storage,
    data.weight,
    data.width,
    data.height,
    data.length,
    data.manufacturer,
  ])
    .then((res) => res.rows[0]);
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

function _makeData(data, structure, isBovid) {
  const storage = _checkStorage(data[structure.storage]);
  const fullTitle = `${data[structure.article]} ${data[structure.title]} ${data.brandTitle || ''}`;
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
    price: priceHandler(data[structure.price]),
    amount: isBovid ? _sumAmount(storage) : (data[structure.amount] || null),
    engArticleParse: parserEng(data[structure.article]) || null,
    engFullTitleParse: parserEng(fullTitle.trim()) || null,
    rusArticleParse: parserRus(fullTitle.trim()) || null,
  };
}

module.exports.add = async (ctx) => {
  const start = Date.now();
  const { brandId, providerId } = ctx.request.body;
  const brandTitle = await _getBrandTitle(brandId);

  let i = 0;
  for (const position of ctx.positions) {
    i += 1;
    if (!(i % 500)) {
      logger.info(`upload ${i} in ${ctx.positions.length}`);
    }

    position.brandTitle = brandTitle;
    const data = _makeData(position, ctx.structure);

    try {
      let pos = await _updatePosition(data, brandId, providerId);

      if (!pos?.bovid_id && data.engArticleParse) {
        data.bovidId = await _getBovidId(data.engArticleParse);
        await _updatePosition(data, brandId, providerId);
      }

      if (!pos) {
        pos = await _insertPosition(data, brandId, providerId);
      }

      await _insertPrice(pos.id, data.price);
    } catch (error) {
      logger.error(`артикул ${data.article} наименование ${data.title}`, error.message);
    }
  }

  logger.info('upload positions complete', (Date.now() - start) / 1000);

  ctx.status = 200;
  ctx.body = {
    message: `upload ${ctx.positions.length} positions complete in ${(Date.now() - start) / 1000}`,
  };
};

function _getBrandTitle(brandId) {
  return db.query(`SELECT title FROM brands
    WHERE id=$1
  `, [brandId])
    .then((res) => res.rows[0]?.title);
}

function _getBovidId(engArticleParse) {
  return db.query(`SELECT id FROM bovid
    WHERE eng_article_parse=$1
  `, [engArticleParse])
    .then((res) => res.rows[0]?.id);
}

function _updatePosition(data, brandId, providerId) {
  return db.query(`UPDATE positions
  SET
    updatedat=DEFAULT,
    bovid_id=$1,
    article=$2,
    title=$3,
    amount=$4,
    rus_article_parse=$5
  WHERE eng_article_parse=$6 AND brand_id=$7 AND provider_id=$8
  RETURNING *
  `, [
    data.bovidId,
    data.article,
    data.title,
    data.amount,
    data.rusArticleParse,
    data.engFullTitleParse,
    brandId,
    providerId,
  ])
    .then((res) => res.rows[0]);
}

function _insertPosition(data, brandId, providerId) {
  return db.query(`INSERT INTO positions
    (
      brand_id, 
      provider_id, 
      bovid_id, 
      article, 
      title, 
      amount,
      rus_article_parse,
      eng_article_parse
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    brandId,
    providerId,
    data.bovidId,
    data.article,
    data.title,
    data.amount,
    data.rusArticleParse,
    data.engFullTitleParse,
  ])
    .then((res) => res.rows[0]);
}

function _insertPrice(positionId, price) {
  return db.query(`INSERT INTO prices
  (position_id, price)
  VALUES ($1, $2)
  `, [positionId, price]);
}
