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
    saveTweet: function(newTweet, username, callback) {
      tweets.insertOne(newTweet, callback);
      users.update({name: username}, {$push: 
        {tweets: newTweet.id}
      });
    },

    getTweets: function(callback) {
      const sortNewestFirst = (a, b) => a.created_at - b.created_at;
      tweets.find().toArray((err, tweets) => {
        callback(err, tweets.sort(sortNewestFirst));
      });
    },

    likeToggle: function(id, username, answer) {
      tweets.findOne({id: id}, (err, tweet) => {
        if(err) {
          answer(err, null, null);
        }
        else {
          if(tweet !== null) {
            users.findOne({name: username}, (err, user) => {
              if(err) {
                answer(err, null, null);
              }
              else {
                
                if(user) {
                  if(!user.tweets.includes(id)) {
                    let summand;
                    if(user.liked_tweet_ids.includes(id)) {
                      let index = user.liked_tweet_ids.indexOf(id);
                      user.liked_tweet_ids.splice(index, 1);
                      summand = -1;
                    }
                    else {
                      user.liked_tweet_ids.push(id);
                      summand = 1;
                    }
                    tweets.update({id: id}, {$set: 
                      {likes: tweet.likes + summand}
                    });
                    users.update({name: username}, user);
                    answer(null, true, false, summand);
                  }
                  else {
                    answer(null, true, true);
                  }
                }
                else {
                  answer(new Error('user not found'), null, null);
                }

              }
            });
          }
          else {
            answer(null, false, null);
          }
        }
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
            is_logged_in: true,
            tweets: [],
            liked_tweet_ids: []
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
