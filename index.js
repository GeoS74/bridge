const config = require('./config');
const app = require('./app');
const logger = require('./libs/logger');

app.listen(config.server.port, (error) => {
  if (error) {
    logger.error(error.message);
    return;
  }
  logger.info(`server run http://${config.server.host}:${config.server.port}`);
});
