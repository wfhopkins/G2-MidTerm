CREATE TABLE  followers (
  id INTEGER REFERENCES users(id),
  resources_id INTEGER REFERENCES users(id)
);
