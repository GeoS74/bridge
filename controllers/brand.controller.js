const db = require('../libs/db');
const mapper = require('../mappers/brand.mapper');

module.exports.get = async (ctx) => {
  const brand = await _getBrand(ctx.params.id);
  if (!brand) {
    ctx.throw(404, 'brand not found');
  }
  ctx.status = 200;
  ctx.body = mapper(brand);
};

module.exports.getAll = async (ctx) => {
  const brands = ctx.query?.title ? 
    await _getSearchBrands(ctx.query?.title) : 
    await _getAllBrands();
  ctx.status = 200;
  ctx.body = brands.map((brand) => mapper(brand));
};

module.exports.add = async (ctx) => {
  const brand = await _addBrand(ctx.request.body.title);
  ctx.status = 201;
  ctx.body = mapper(brand);
};

module.exports.update = async (ctx) => {
  const brand = await _updateBrand(ctx.params.id, ctx.request.body.title);
  if (!brand) {
    ctx.throw(404, 'brand not found');
  }
  ctx.status = 200;
  ctx.body = mapper(brand);
};

module.exports.delete = async (ctx) => {
  const brand = await _deleteBrand(ctx.params.id);
  if (!brand) {
    ctx.throw(404, 'brand not found');
  }
  ctx.status = 200;
  ctx.body = mapper(brand);
};

async function _getBrand(id) {
  return db.query('SELECT * FROM brands WHERE id=$1', [id])
    .then((res) => res.rows[0]);
}

async function _getAllBrands() {
  return db.query('SELECT * FROM brands')
    .then((res) => res.rows);
}

async function _getSearchBrands(title) {
  return db.query("SELECT * FROM brands WHERE LOWER(title) LIKE '%' || $1 || '%'", [title.toLowerCase()])
    .then((res) => res.rows);
}

async function _addBrand(title) {
  return db.query(`INSERT INTO brands 
    (title) VALUES ($1) 
    RETURNING *
    `, [title])
    .then((res) => res.rows[0]);
}

async function _updateBrand(id, title) {
  return db.query(`UPDATE brands 
    SET
      title=$2
    WHERE id=$1
    RETURNING *
    `, [id, title])
    .then((res) => res.rows[0]);
}

async function _deleteBrand(id) {
  return db.query(`DELETE FROM brands 
    WHERE id=$1
    RETURNING *
    `, [id])
    .then((res) => res.rows[0]);
}
