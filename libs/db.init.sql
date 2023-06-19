CREATE TABLE brands (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      title TEXT NOT NULL
);
CREATE TABLE providers (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      title TEXT NOT NULL
);
CREATE TABLE bovid (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      uid UUID UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      article TEXT,
      eng_article_parse TEXT,
      title TEXT,
      amount REAL DEFAULT 0,
      storage JSON,
      weight REAL DEFAULT 0,
      width REAL DEFAULT 0,
      height REAL DEFAULT 0,
      length REAL DEFAULT 0,
      manufacturer TEXT
);
CREATE TABLE positions (
      id SERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMP NOT NULL DEFAULT NOW(),
      brand_id INTEGER NOT NULL REFERENCES brands ON DELETE CASCADE,
      provider_id INTEGER NOT NULL REFERENCES providers ON DELETE CASCADE,
      bovid_id INTEGER REFERENCES bovid,
      article TEXT,
      title TEXT,
      manufacturer TEXT,
      photo JSON,
      alias TEXT,
      amount REAL DEFAULT 0,
      eng_article_parse TEXT NOT NULL,
      rus_article_parse TSVECTOR,
      glue_article_parse TEXT
);
CREATE TABLE prices (
      id BIGSERIAL PRIMARY KEY,
      createdat TIMESTAMP NOT NULL DEFAULT NOW(),
      position_id INTEGER NOT NULL REFERENCES positions ON DELETE CASCADE,
      price REAL NOT NULL,
      profit REAL DEFAULT 0
);
CREATE INDEX bovid_idx ON bovid (eng_article_parse);
CREATE INDEX positions_idx ON positions (eng_article_parse, brand_id, provider_id);
CREATE INDEX positions_glue_idx ON positions (glue_article_parse);
CREATE INDEX textsearch_idx ON positions USING GIN (rus_article_parse);
CREATE INDEX prices_idx ON prices (position_id);