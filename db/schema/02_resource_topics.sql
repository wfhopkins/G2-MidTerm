CREATE TABLE  resource_topics (
  id SERIAL PRIMARY KEY NOT NULL,
  topics_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  resources_id INTEGER REFERENCES resources(id) ON DELETE CASCADE
);
