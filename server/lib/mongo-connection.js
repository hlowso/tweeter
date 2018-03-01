const MongoClient   = require("mongodb").MongoClient;
const MONGODB_URI   = "mongodb://localhost:27017/tweeter";

// Here I export a function that will be passed to a Promise 
// in index.js. This function connects to our mongo database and 
// 'returns' the database by passing it to the resolve function.
module.exports = function(resolve, reject) {
    MongoClient.connect(MONGODB_URI, (err, db) => {
      if(err) {
        console.error(`Failed to connect: ${MONGODB_URI}`);
        throw err;
      }
      console.log(`Connected to mongodb: ${MONGODB_URI}`);
      resolve(db);
    });
};