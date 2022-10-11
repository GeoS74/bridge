const Koa = require('koa');

const errorCatcher = require('./middleware/error.catcher');
const clientRoutes = require('./routes/client.routes');
const fileRoutes = require('./routes/file.routes');
const brandRoutes = require('./routes/brand.routes');

const app = new Koa();

app.use(errorCatcher);
app.use(clientRoutes);
app.use(fileRoutes);
app.use(brandRoutes);

module.exports = app;
