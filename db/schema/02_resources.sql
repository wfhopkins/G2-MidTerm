DROP TABLE IF EXISTS resources CASCADE;

CREATE TABLE  resources (
  id SERIAL PRIMARY KEY NOT NULL,
  users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  thumbnail_path VARCHAR(255) DEFAULT '/public/images/thumbs/default.png',
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  rating SMALLINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
