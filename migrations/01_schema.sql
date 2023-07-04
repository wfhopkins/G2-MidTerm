DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS resource_topics CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;

----------------------------------------------------------------
------------------------ Primary tables ------------------------
----------------------------------------------------------------

CREATE TABLE  users (
  id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL
);

CREATE TABLE  resources (
  id SERIAL PRIMARY KEY NOT NULL,
  users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type INTEGER NOT NULL DEFAULT 0,
  rating SMALLINT,
  liked BOOLEAN DEFAULT TRUE
);

----------------------------------------------------------------
------------------- Secondary tables ---------------------------
----------------------------------------------------------------

CREATE TABLE  comments (
  id SERIAL PRIMARY KEY NOT NULL,
  users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  resources_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  comment TEXT
);


CREATE TABLE  topics (
  id SERIAL PRIMARY KEY NOT NULL,
  resources_topics_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

----------------------------------------------------------------
------------------- Bridging tables ----------------------------
----------------------------------------------------------------

CREATE TABLE  resource_topics (
  id SERIAL PRIMARY KEY NOT NULL,
  topics_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  resources_id INTEGER REFERENCES resources(id) ON DELETE CASCADE
);


----------------------------------------------------------------
-------- Self-join tables (shut off ON DELETE CASCADE) ---------
----------------------------------------------------------------

CREATE TABLE  followers (
  id INTEGER REFERENCES users(id),
  resources_id INTEGER REFERENCES users(id)
);


