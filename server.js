// load .env data into process.env
require('dotenv').config();

// Web server config
// const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');

const PORT = process.env.PORT || 8080;
const app = express();

app.set('view engine', 'ejs');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
// app.use(
//   '/styles',
//   sassMiddleware({
//     source: __dirname + '/styles',
//     destination: __dirname + '/public/styles',
//     isSass: false, // false => scss, true => sass
//   })
// );
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


// Our database of users
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
    description: "Everything about bulldogs",
    type: "Encyclopedia",
    rating: 7,
    like: true
  },
  "2": {
    id: "2",
    users_id: "2",
    url: "https://www.cnn.com/interactive/2022/12/world/best-space-photos-2022/index.html",
    title: "Bulldogs",
    description: "Everything about bulldogs",
    type: "Encyclopedia",
    rating: 7,
    like: true
  },
  "3": {
    id: "3",
    users_id: "3",
    url: "https://en.wikipedia.org/wiki/Giraffe",
    title: "Bulldogs",
    description: "Everything about bulldogs",
    type: "Encyclopedia",
    rating: 7,
    like: true
  },
  "4": {
    id: "4",
    users_id: "2",
    url: "https://www.cnn.com/interactive/2022/12/world/best-space-photos-2022/index.html",
    title: "Bulldogs",
    description: "Everything about bulldogs",
    type: "Encyclopedia",
    rating: 7,
    like: true
  },
  "5": {
    id: "5",
    users_id: "3",
    url: "https://en.wikipedia.org/wiki/Giraffe",
    title: "Bulldogs",
    description: "Everything about bulldogs",
    type: "Encyclopedia",
    rating: 7,
    like: true
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
  const templateVars = {users: users, resources: resources, resources_topics: resources_topics, topics: topics, comments: comments};
  res.render("home", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
