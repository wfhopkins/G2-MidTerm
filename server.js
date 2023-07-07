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
  port: process.env.DB_PORT
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


// // Our database of users
let users = {
  "1": {
    id: "1",
    username: "user1",
    email: "user1@example.com",
    password: "purple-rabbit-dinosaur",
    first_name: "David",
    last_name: "Fatokun"
  },
  "2": {
    id: "2",
    username: "user2",
    email: "user2@example.com",
    password: "purple-dinosaur",
    first_name: "William",
    last_name: "Hopkins"
  },
  "3": {
    id: "3",
    username: "user3",
    email: "user3@example.com",
    password: "rabbit-dinosaur",
    first_name: "Jordan",
    last_name: "Dennis"
  }
};

let resources = {
  "1": {
    id: "1",
    users_id: "1",
    url: "https://en.wikipedia.org/wiki/Bulldog",
    title: "Bulldogs",
    description: "The Bulldog is a British breed of dog of mastiff type. It may also be known as the English Bulldog or British Bulldog. It is a medium sized, muscular dog of around 40–55 lb (18–25 kg)",
    type: "Encyclopedia",
    rating: 7,
    like: true,
    likes: 22,
    created_at: "1687836872069"
  },
  "2": {
    id: "2",
    users_id: "2",
    url: "https://www.cnn.com/interactive/2022/12/world/best-space-photos-2022/index.html",
    title: "Space",
    description: "Best space photos from last year",
    type: "Encyclopedia",
    rating: 7,
    like: true,
    likes: 18,
    created_at: "1687836872069"
  },
  "3": {
    id: "3",
    users_id: "3",
    url: "https://en.wikipedia.org/wiki/Giraffe",
    title: "Giraffes",
    description: "Everything about giraffes",
    type: "Encyclopedia",
    rating: 7,
    like: true,
    likes: 16,
    created_at: "1687836872069"
  },
  "4": {
    id: "4",
    users_id: "2",
    url: "https://www.cnn.com/interactive/2022/12/world/best-space-photos-2022/index.html",
    title: "Bulldogs",
    description: "Everything about bulldogs",
    type: "Encyclopedia",
    rating: 7,
    like: true,
    likes: 12,
    created_at: "1687836872069"
  },
  "5": {
    id: "5",
    users_id: "3",
    url: "https://en.wikipedia.org/wiki/Giraffe",
    title: "Giraffes",
    description: "Everything about giraffes",
    type: "Encyclopedia",
    rating: 7,
    like: true,
    likes: 10,
    created_at: "1687836872069"
  }
};

let resources_topics = {
  "1": {
    id: "1",
    resources_id: "1",
    topics_id: "1"
  }
};

let topics = {
  "1": {
    id: "1",
    name: "Dogs",
    resources_id: "1"
  }
};

let comments = {
  "1": {
    id: "1",
    users_id: "1",
    resources_id: "1",
    comment: "I Love bulldogs"
  }
};


app.get('/', (req, res) => {

  pool.query("SELECT * FROM resources JOIN users ON users.id = users_id")
    .then((result) => {
      const resources = result.rows;
      // for (const key in rs) {
      //   resources[key]["time_ago"] = timeago.format(new Date(rs[key]["created_at"]));
      // }
      let templateVars = { resources: resources };
      pool.query("SELECT * FROM users ")
        .then((result) => {
          const users = result.rows;
          let templateVars = { resources: resources, users: users, timeago: timeago};
          res.render("home", templateVars);
        })
    })
  // let rs = resources;
  // for (const key in rs) {
  //   rs[key]["time_ago"] = timeago.format(rs[key]["created_at"]);
  // }
  // const templateVars = {users: users, resources: rs, resources_topics: resources_topics, topics: topics, comments: comments};
  // res.render("home", templateVars);
});

app.get('/create', (req, res) => {
  res.render("create");
});

app.post('/create', (req, res) => {
  const url = req.body.url;
  const title = req.body.title;
  const description = req.body.description;
  const type = 1; //req.body.category;
  // console.log("test", url);
  //1. After getting all the values from the Form, we are going to insert it into the Database table
  //Insert Query for the table
  pool.query(`
    INSERT INTO resources (users_id, url, title, description, type)
    VALUES ($1, $2, $3, $4, $5)`, [1, url, title, description, type])
    .then((result) => {
      console.log("Insert Statement worked ", result);
      res.redirect("/");
    })
});



app.get('/explore', (req, res) => {
  let rs = resources;
  for (const key in rs) {
    rs[key]["time_ago"] = timeago.format(rs[key]["created_at"]);
  }
  const templateVars = { users: users, resources: rs, resources_topics: resources_topics, topics: topics, comments: comments };
  res.render("explore", templateVars);
});

app.get('/resources/:id', (req, res) => {
  let id = req.params.id;
  let resource = resources[id];
  // console.log(resource);
  resource["time_ago"] = timeago.format(resource["created_at"]);
  const templateVars = { users: users, resource: resource, resources_topics: resources_topics, topics: topics, comments: comments };
  res.render("resource", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
