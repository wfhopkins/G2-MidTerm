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
  const id = 1;
  const resourcesPromise = pool.query("SELECT resources.*, users.username as username FROM resources JOIN users ON users.id = users_id WHERE users.id = $1", [id]);
  const topicsPromise = pool.query("SELECT * FROM topics ORDER BY name")
  const promises = [resourcesPromise, topicsPromise];

  Promise.all(promises)
    .then((result) => {
      const resources = result[0].rows;
      const topics = result[1].rows;
      let templateVars = { resources: resources, topics: topics, timeago: timeago };
      res.render("home", templateVars);
    })


  // const id = 1;
  // const resourcesPromise = pool.query("SELECT resources.*, users.username as username FROM resources JOIN users ON users.id = users_id WHERE users_id = $1", [id]);
  // const topicsPromise = pool.query("SELECT * FROM topics ORDER BY name")
  // const commentPromise = pool.query("SELECT *, users.id as user_id FROM comments JOIN resources ON resources.id = comments.resources_id JOIN users ON users.id = resources.users_id WHERE user_id = $1", [id])
  // const likesPromise = pool.query("SELECT DISTINCT count(*) as total_likes FROM likes JOIN resources ON resources.id = comments.resources_id JOIN users ON users.id = resources.users_id WHERE users.id = $1", [id])
  // const promises = [resourcesPromise, topicsPromise, commentPromise, likesPromise];
});

app.get('/create', (req, res) => {
  pool.query("SELECT * FROM topics ORDER BY name")
    .then((result) => {
      const topics = result.rows;
      let templateVars = { topics: topics }
      res.render("create", templateVars);
    })
});

app.post('/create', (req, res) => {
  const url = req.body.url;
  const title = req.body.title;
  const description = req.body.description;
  const topic = req.body.topic;

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
  //  SELECT * FROM topics
  //  WHERE topics = req.???
  // `)
  console.log(req.body);
})


app.get('/explore', (req, res) => {
  // const resourcesPromise = pool.query("SELECT resources.*, users.username as username FROM resources JOIN users ON users.id = users_id WHERE users.id = $1", [id]);
  pool.query("SELECT * FROM resources JOIN users ON users.id = users_id")
    .then((result) => {
      const resources = result.rows;
      console.log(resources);
      pool.query("SELECT * FROM topics ORDER BY name")
        .then((result) => {
          const topics = result.rows;
          let templateVars = { resources: resources, topics: topics, timeago: timeago };
          console.log(templateVars);
          res.render("explore", templateVars);
        })
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
      let templateVars = { resource: resource, comments: comments, likes: likes, topics: topics, timeago: timeago };
      res.render("resource", templateVars);
    })
});

app.get('/resources/:id/edit', (req, res) => {
  pool.query("SELECT * FROM resources JOIN users ON users.id = users_id WHERE resources.id = $1", [req.params.id])
    .then((result) => {
      const resource = result.rows[0];
      pool.query("SELECT * FROM topics ORDER BY name")
        .then((result) => {
          const topics = result.rows;
          let templateVars = { resource: resource, topics: topics, timeago: timeago };
          res.render("edit", templateVars);
        })
    })
});

app.post('/resources/:id/edit', (req, res) => {
  const url = req.body.url;
  const title = req.body.title;
  const description = req.body.description;
  const rating = req.body.rating;
  pool.query(`
    UPDATE resources SET url = $1, title = $2, description = $3, rating = $4, WHERE id = $5`, [url, title, description, rating, req.params.id])
    .then((result) => {
      res.redirect("/create");
    })
});

app.post('/resources/:id/delete', (req, res) => {
  pool.query("DELETE FROM resources WHERE id = $1", [req.params.id])
    .then(() => {
      res.redirect("/explore");
    })
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
