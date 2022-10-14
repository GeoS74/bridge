const db = require('../libs/db');

(async (_) => {
  await db.query('insert into brands (title) values (\'УРАЛ\'), (\'КАМАЗ\'), (\'ЯМЗ\')');
  await db.query('insert into providers (title) values (\'АЗ "УРАЛ"\'), (\'Автодизель\'), (\'СТФК КАМАЗ\')');
  process.exit();
})();
