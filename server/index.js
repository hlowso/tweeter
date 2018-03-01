/*jslint node: true */
"use strict";

// Basic express setup:

const PORT          = 8080;
const express       = require("express");
const bodyParser    = require("body-parser");
const app           = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// SWITCHING TO MONGODB

let db, DataHelpers, tweetsRoutes; 

// Here I nest the code for initializing the database and starting up the 
// app inside the .then() function of a promise to ensure that the app is only
// running once the connection to the database has been made successfully.

// The function passed to the Promise constructor is the export of my mongo
// connection file, which is located in the /server/lib/ directory
const connection = new Promise(require("./lib/mongo-connection.js"))
.then((mongo_database) => { 

  db = mongo_database;
  DataHelpers = require("./lib/data-helpers.js")(db);
  tweetsRoutes = require("./routes/tweets")(DataHelpers);

  app.use("/tweets", tweetsRoutes);
  app.listen(PORT, () => {
    console.log("Example app listening on port " + PORT);
  });

});
