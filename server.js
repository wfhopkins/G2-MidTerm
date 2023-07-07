// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 8080;
const timeago = require('timeago.js');
app.set('view engine', 'ejs');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
}
const pool = new Pool(dbConfig);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const userApiRoutes = require('./routes/users-api');
const widgetApiRoutes = require('./routes/widgets-api');
const usersRoutes = require('./routes/users');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// Note: Endpoints that return data (eg. JSON) usually start with `/api`
app.use('/api/users', userApiRoutes);
app.use('/api/widgets', widgetApiRoutes);
app.use('/users', usersRoutes);
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get('/', (req, res) => {

  const resourcesPromise = pool.query("SELECT resources.*, users.username as username FROM resources JOIN users ON users.id = users_id")
  const topicsPromise = pool.query("SELECT * FROM topics ORDER BY name")
  const promises = [resourcesPromise, topicsPromise]

  Promise.all(promises)
    .then((result) => {
      const resources = result[0].rows;
      const topics = result[1].rows;
      let templateVars = { resources: resources, topics: topics, timeago: timeago };
      res.render("home", templateVars);
    })
});

app.get('/create', (req, res) => {
  pool.query("SELECT * FROM topics ORDER BY name")
  .then((result) => {
    const topics = result.rows;
    let templateVars = {topics: topics}
    res.render("create", templateVars);
  })
});

app.post('/create', (req, res) => {
  const url = req.body.url;
  const title = req.body.title;
  const description = req.body.description;
  const topic = req.body.topic;

  // console.log("test", url);
  //1. After getting all the values from the Form, we are going to insert it into the Database table
  //Insert Query for the table
  pool.query(`
    INSERT INTO resources (users_id, url, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id`, [1, url, title, description])
    .then((result) => {
      const resource_id = result.rows[0].id;
      return pool.query(`INSERT INTO resources_topics (resources_id, topics_id)
      VALUES($1, $2)`, [resource_id, topic])
    })
    .then(() => {
      console.log("Insert Statement worked ");
      res.redirect("/");
    })
});


app.post('/topics', (req, res) => {
  // pool.query(`
  //   SELECT * FROM topics
  // `)
  console.log(req.body);
})


app.get('/explore', (req, res) => {
  pool.query("SELECT * FROM resources JOIN users ON users.id = users_id")
    .then((result) => {
      const resources = result.rows;
      let templateVars = { resources: resources, timeago: timeago };
      res.render("explore", templateVars);
    })
});

app.get('/resources/:id', (req, res) => {

  const resourcePromise = pool.query("SELECT * FROM resources JOIN users ON users.id = users_id WHERE resources.id = $1", [req.params.id])
  const commentPromise = pool.query("SELECT * FROM comments JOIN users ON users.id = users_id WHERE resources_id = $1", [req.params.id])
  const likesPromise = pool.query("SELECT DISTINCT count(*) as total_likes FROM likes WHERE resources_id = $1", [req.params.id])
  const topicsPromise = pool.query("SELECT * FROM topics ORDER BY name")
  const promises = [resourcePromise, commentPromise, likesPromise, topicsPromise]

  Promise.all(promises)
  .then((result) => {
    const resource = result[0].rows[0];
    const comments = result[1].rows;
    const likes = result[2].rows[0].total_likes;
    const topics = result[3].rows;
    console.log("comments", comments);
      let templateVars = { resource: resource, comments: comments, likes: likes, topics: topics, timeago: timeago };
      res.render("resource", templateVars);
    })
});

app.get('/resources/:id/edit', (req, res) => {
  let id = req.params.id;
  let resource = resources[id];
  // console.log(resource);
  resource["time_ago"] = timeago.format(resource["created_at"]);
  const templateVars = { users: users, resource: resource, resources_topics: resources_topics, topics: topics, comments: comments };
  res.render("resource", templateVars);
});

app.post('/resources/:id/edit', (req, res) => {
  const url = req.body.url;
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const rating = req.body.rating;
  const liked = req.body.liked;
  pool.query(`
    UPDATE resources SET url = $1, title = $2, description = $3, category = $4, rating = $5, liked = $6 WHERE id = $7`, [url, title, description, category, rating, liked, req.params.id])
    .then((result) => {
      res.redirect("/");
    })
});

app.post('/resources/:id/delete', (req, res) => {
  pool.query("DELETE FROM resources WHERE id = $1", [req.params.id])
    .then(() => {
      res.redirect("/");
    })
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
