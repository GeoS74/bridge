const Koa = require('koa');
const { readdir, mkdir } = require('node:fs/promises');

const errorCatcher = require('./middleware/error.catcher');
const docsRoutes = require('./routes/docs.routes');
const clientRoutes = require('./routes/client.routes');
const fileRoutes = require('./routes/file.routes');
const brandRoutes = require('./routes/brand.routes');
const providerRoutes = require('./routes/provider.routes');

(async () => {
  try {
    await readdir('./files');
  } catch (error) {
    mkdir('./files');
  }
})();

const app = new Koa();

app.use(errorCatcher);
app.use(docsRoutes);
app.use(clientRoutes);
app.use(brandRoutes);
app.use(providerRoutes);
app.use(fileRoutes);

module.exports = app;
