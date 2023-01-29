const db = require('../libs/db');
const mapper = require('../mappers/provider.mapper');

module.exports.get = async (ctx) => {
  const provider = await _getProvider(ctx.params.id);
  if (!provider) {
    ctx.throw(404, 'provider not found');
  }
  ctx.status = 200;
  ctx.body = mapper(provider);
};

module.exports.getAll = async (ctx) => {
  const providers = ctx.query?.title
    ? await _getSearchProviders(ctx.query?.title)
    : await _getAllProviders();
  ctx.status = 200;
  ctx.body = providers.map((provider) => mapper(provider));
};

module.exports.add = async (ctx) => {
  const provider = await _addProvider(ctx.request.body.title);
  ctx.status = 201;
  ctx.body = mapper(provider);
};

module.exports.update = async (ctx) => {
  const provider = await _updateProvider(ctx.params.id, ctx.request.body.title);
  if (!provider) {
    ctx.throw(404, 'provider not found');
  }
  ctx.status = 200;
  ctx.body = mapper(provider);
};

module.exports.delete = async (ctx) => {
  const provider = await _deleteProvider(ctx.params.id);
  if (!provider) {
    ctx.throw(404, 'provider not found');
  }
  ctx.status = 200;
  ctx.body = mapper(provider);
};

async function _getProvider(id) {
  return db.query('SELECT * FROM providers WHERE id=$1', [id])
    .then((res) => res.rows[0]);
}

async function _getAllProviders() {
  return db.query('SELECT * FROM providers')
    .then((res) => res.rows);
}

async function _getSearchProviders(title) {
  return db.query("SELECT * FROM providers WHERE LOWER(title) LIKE '%' || $1 || '%'", [title.toLowerCase()])
    .then((res) => res.rows);
}

async function _addProvider(title) {
  return db.query(`INSERT INTO providers 
    (title) VALUES ($1) 
    RETURNING *
    `, [title])
    .then((res) => res.rows[0]);
}

async function _updateProvider(id, title) {
  return db.query(`UPDATE providers 
    SET
      title=$2
    WHERE id=$1
    RETURNING *
    `, [id, title])
    .then((res) => res.rows[0]);
}

async function _deleteProvider(id) {
  return db.query(`DELETE FROM providers 
    WHERE id=$1
    RETURNING *
    `, [id])
    .then((res) => res.rows[0]);
}
