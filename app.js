const Koa = require('koa');

const clientRoutes = require('./routes/client.routes');

const app = new Koa();

app.use(clientRoutes);

module.exports = app;
