CREATE TABLE  topics (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT,
  resources_topics_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
