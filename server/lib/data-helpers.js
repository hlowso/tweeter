/*jslint node: true */
"use strict";

// Defines helper functions for accessing the two collections in the database: tweets and users.
module.exports = function makeDataHelpers(db) {

  const tweets = db.collection('tweets');
  const users = db.collection('users');

  return {

    // To save a tweet we add it to the tweets collection
    // and add its ID to the creator's array of tweets in the
    // users collection.
    saveTweet: function(newTweet, username, callback) {
      tweets.insertOne(newTweet, callback);
      users.update({name: username}, {$push: 
        {tweets: newTweet.id}
      });
    },

    // In this function we get all the tweets from the tweets collection
    // and also the array from the users collection containing the IDs of
    // all the tweets that the user with the name username had liked.
    getTweets: function(username, callback) {
      const sortNewestFirst = (a, b) => a.created_at - b.created_at;
      users.findOne({name: username}, (err, user) => {
        if(err) {
          callback(err, null, null);
        }
        tweets.find().toArray((err, tweets) => {
          callback(err, tweets.sort(sortNewestFirst), user.liked_tweet_ids);
        });
      });
      
    },

    // This function changes the liked status of the tweet with ID id
    // wrt the user with name username. This is only allowed if both the
    // user and the tweet exist and if the id cannot be found among those
    // in the user.tweets array, i.e if the user didn't make the tweet.
    // In that case, we call the callback function with the following arguments:
    // (error), (tweet exists (boolean)), (user made the tweet (boolean)), 
    // (1 or -1 dependin on whether the status of the tweet was already 'liked') 
    likeToggle: function(id, username, callback) {
      tweets.findOne({id: id}, (err, tweet) => {
        if(err) {
          callback(err, null, null);
        }
        else {
          if(tweet !== null) {
            users.findOne({name: username}, (err, user) => {
              if(err) {
                callback(err, null, null);
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
                    callback(null, true, false, summand);
                  }
                  else {
                    callback(null, true, true);
                  }
                }
                else {
                  callback(new Error('user not found'), null, null);
                }

              }
            });
          }
          else {
            callback(null, false, null);
          }
        }
      });
    },

    // The is_logged_in attribute of the user object contains
    // the boolean indicating whether or not a user is logged in.
    // We simply look at this boolean to check the login status of a user.
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

    // Login and registration functionality are both provided by 
    // this function. If a user didn't exist previously, they are 
    // added to the database with clean attributes. Otherwise their
    // is_logged_in attribute is set to true.
    login: function(new_username, callback) {
      users.findOne({name: new_username}, (err, user) => {
        if(err) {
          callback(err, null);
        }
        else if(user === null) {
          const new_user = {
            name: new_username,
            is_logged_in: true,
            tweets: [],
            liked_tweet_ids: []
          };
          users.insertOne(new_user, (err) => callback(err, false));
        }
        else {
          users.update({name: new_username}, {$set:
            {is_logged_in: true}
          });
          callback(null, true);
        }
      });
    },

    // If the user exists, this function sets their login 
    // status to false.
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
    }

  };
};
