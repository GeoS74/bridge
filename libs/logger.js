const log4js = require('log4js');
const path = require('path');

const config = require('../config');

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: {
      type: 'file',
      filename: path.join(__dirname, `../log/${config.log.file}`),
    },
  },
  categories: {
    default: {
      appenders: ['out', 'app'],
      level: 'all',
    },
  },
});

module.exports = log4js.getLogger('default');
