/*jslint node: true */
"use strict";

// Simulates the kind of delay we see with network or filesystem operations
// const simulateDelay = require("./util/simulate-delay");

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {

  const tweets = db.collection('tweets');
  const users = db.collection('users');

  return {

    // ACCESSING 'tweets' COLLECTION
    saveTweet: function(newTweet, callback) {
        tweets.insertOne(newTweet, callback);
    },

    getTweets: function(callback) {
        const sortNewestFirst = (a, b) => a.created_at - b.created_at;
        tweets.find().toArray((err, tweets) => {
          callback(err, tweets.sort(sortNewestFirst));
        });
    },

    // ACCESSING 'users' COLLECTION
    isLoggedIn: function(username, callback) {
      users.findOne({name: username}, (err, user) => {
        if(err) {
          callback(err, null);
        }
        else if(user === null) {
          callback(null, null);
        }
        else { 
          if(user.is_logged_in) {
            callback(null, true);
          }
          else {
            callback(null, false);
          }
        }
      });
    },

    login: function(new_username, answerUserExists) {
      users.findOne({name: new_username}, (err, user) => {
        if(err) {
          answerUserExists(err, null);
        }
        else if(user === null) {
          const new_user = {
            name: new_username,
            is_logged_in: true
          };
          users.insertOne(new_user, (err) => answerUserExists(err, false));
        }
        else {
          users.update({name: new_username}, {$set:
            {is_logged_in: true}
          });
          answerUserExists(null, true);
        }
      });
    },

    logout: function(username, answer) {
      users.findOne({name: username}, (err, user) => {
        if(err) {
          answer(err);
        }
        else if(user === null) {
          answer(null);
        }
        else {
          users.update({name: username},{$set:
            {is_logged_in: false}
          });
          answer(null);
        }
      });
    },

    lookUpUser: function(username, callback) {
      db.collection('users').findOne({name: username}, callback);
    }

  };
};
