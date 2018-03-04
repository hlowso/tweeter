/*jslint node: true */
"use strict";

// Basic express setup:

const PORT           = 8080;
const express        = require("express");
const path           = require('path');
const sassMiddleware = require('node-sass-middleware');
const bodyParser     = require("body-parser");
const cookieSession  = require('cookie-session');
const app            = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'Listen... doo wah oooh... Do you want to know a secret?.. doo wah oooh'
}));

app.use(express.static(path.join(__dirname, '../public')));

// SWITCHING TO MONGODB

let db, DataHelpers, tweetsRoutes, authentication; 

// Here I nest the code for initializing the database and starting up the 
// app inside the .then() function of a promise to ensure that the app is only
// running once the connection to the database has been made successfully.

// The function passed to the Promise constructor is the export of my mongo
// connection file, which is located in the /server/lib/ directory

const connection = new Promise(require("./lib/mongo-connection.js"))
.then((mongo_database) => { 

  db = mongo_database;
  DataHelpers =    require("./lib/data-helpers.js")(db);
  authentication = require("./routes/authentication.js")(DataHelpers);
  tweetsRoutes =   require("./routes/tweets.js")(DataHelpers);

  app.use("/authentication", authentication.routes);
  app.use("/tweets", tweetsRoutes);

  app.listen(PORT, () => {
    console.log("Example app listening on port " + PORT);
  });

});
