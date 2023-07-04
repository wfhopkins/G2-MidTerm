DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS resource_topics CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;

\i db/schema/06_users.sql
\i db/schema/05_resources.sql
\i db/schema/04_comments.sql
\i db/schema/03_followers.sql
\i db/schema/01_topics.sql
\i db/schema/02_resource_topics.sql
