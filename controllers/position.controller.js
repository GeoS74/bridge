const XLSX = require('xlsx');
const { parserEng, parserRus, parserGlue } = require('../libs/article.parser');
const { convStringToReal } = require('../libs/price.handler');
const db = require('../libs/db');
const logger = require('../libs/logger');
const config = require('../config');

module.exports = {
  addBovid,
  add,
  download,
};

async function addBovid(ctx) {
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
}

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

function _makeString(str) {
  if (!str) {
    return '';
  }
  return str.toString().trim() || '';
}

function _makeData(data, structure, isBovid) {
  const storage = _checkStorage(data[structure.storage]);
  const fullTitle = `${_makeString(data[structure.article])} ${_makeString(data[structure.title])} ${_makeString(data.brandTitle)} ${_makeString(data[structure.manufacturer])}`;
  return {
    uid: data[structure.uid] || null,
    code: data[structure.code] || null,
    article: data[structure.article] || null,
    title: data[structure.title] || null,
    weight: data[structure.weight] || 0,
    width: data[structure.width] || 0,
    height: data[structure.height] || 0,
    length: data[structure.length] || 0,
    manufacturer: data[structure.manufacturer] || null,
    storage: JSON.stringify(storage),
    price: convStringToReal(data[structure.price]),
    amount: isBovid ? _sumAmount(storage) : convStringToReal(data[structure.amount]),
    engArticleParse: parserEng(data[structure.article]) || null,
    engFullTitleParse: parserEng(fullTitle.trim()) || null,
    rusFullTitleParse: parserRus(fullTitle.trim()) || null,
    glueArticleParse: parserGlue(fullTitle.trim()) || null,
  };
}

async function add(ctx) {
  const start = Date.now();
  const { brandId, providerId, profit } = ctx.request.body;
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

      if (!data.article && !data.title) {
        throw new Error('позиция без артикула и наименования');
      }

      // используй это если есть интеграция с 1С
      // if (!pos?.bovid_id && data.engArticleParse) {
      //   data.bovidId = await _getBovidId(data.engArticleParse);
      //   pos = await _updatePosition(data, brandId, providerId);
      // }

      if (!pos) {
        pos = await _insertPosition(data, brandId, providerId);
      }

      await _insertPrice(pos.id, data.price, profit);
    } catch (error) {
      logger.error(`артикул ${data.article} наименование ${data.title}`, error.message);
    }
  }

  logger.info('upload positions complete in', (Date.now() - start) / 1000);

  ctx.status = 200;
  ctx.body = {
    message: `upload ${ctx.positions.length} positions complete in ${(Date.now() - start) / 1000}`,
  };
}

function _getBrandTitle(brandId) {
  return db.query(`SELECT title FROM brands
    WHERE id=$1
  `, [brandId])
    .then((res) => res.rows[0]?.title);
}

// используй это если есть интеграция с 1С
// function _getBovidId(engArticleParse) {
//   return db.query(`SELECT id FROM bovid
//     WHERE eng_article_parse=$1
//   `, [engArticleParse])
//     .then((res) => res.rows[0]?.id);
// }

function _updatePosition(data, brandId, providerId) {
  return db.query(`UPDATE positions
  SET
    updatedat=DEFAULT,
    bovid_id=$1,
    article=$2,
    title=$3,
    amount=$4,
    rus_article_parse=to_tsvector('pg_catalog.russian', coalesce($5, ''))
  WHERE eng_article_parse=$6 AND brand_id=$7 AND provider_id=$8
  RETURNING *
  `, [
    data.bovidId,
    data.article,
    data.title,
    data.amount,
    data.rusFullTitleParse,
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
      manufacturer,
      rus_article_parse,
      eng_article_parse,
      glue_article_parse
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, to_tsvector('pg_catalog.russian', coalesce($8, '')), $9, $10)
    RETURNING *
  `, [
    brandId,
    providerId,
    data.bovidId,
    data.article,
    data.title,
    data.amount,
    data.manufacturer,
    data.rusFullTitleParse,
    data.engFullTitleParse,
    data.glueArticleParse,
  ])
    .then((res) => res.rows[0]);
}

function _insertPrice(positionId, price, profit) {
  return db.query(`INSERT INTO prices
  (position_id, price, profit)
  VALUES ($1, $2, $3)
  `, [positionId, price, profit]);
}

async function download(ctx) {
  const start = Date.now();

  const price = await _getPrice();

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(price);
  XLSX.utils.book_append_sheet(wb, ws);

  const result = await XLSX.write(wb, {
    type: 'buffer',
    bookType: 'xlsx',
  });

  logger.info('download positions complete in', (Date.now() - start) / 1000);

  ctx.set('Content-Disposition', 'attachment; filename="SheetJSNode.xlsx"');
  ctx.set('Content-Type', 'application/vnd.ms-excel');
  ctx.status = 200;
  ctx.body = result;
}

async function _getPrice() {
  const price = [['№ п/п', 'Артикл', 'Наименование', 'Цена с НДС', 'Кол-во', 'Производитель', 'Склад']];
  const positions = await _selectAllPosition();

  positions.forEach((pos, i) => {
    price.push([
      i + 1,
      pos.article,
      pos.title,
      Math.round(pos.settlement_price * 100) / 100,
      Math.round(pos.amount * 100) / 100,
      pos.manufacturer,
      pos.stock,
    ]);
  });
  return price;
}

function _selectAllPosition() {
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
      case 
        when M.createdat < NOW() - interval '${config.search.ttl}' then 0
        else P.amount end
        as amount,
      P.manufacturer
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
    ORDER BY id DESC
  `)
    .then((res) => res.rows);
}
