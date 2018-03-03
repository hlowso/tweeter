/*jslint node: true */
"use strict";

const userHelper    = require("../lib/util/user-helper");
const express        = require('express');
const tweetsRoutes   = express.Router();

function generateId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = '';
  for(let i = 0; i < 40; i ++) {
    id += chars.charAt(Math.random() * chars.length);
  }
  return id;
}

// The only thing I modified in this file is line 43:
// I send the tweet object back to the client-side app
// so that it can be displayed immediately.

module.exports = function(DataHelpers) {

  const authentication = require('./authentication.js')(DataHelpers);
  tweetsRoutes.use(authentication.middleware);


  tweetsRoutes.get("/", function(req, res) {
    const username = req.session.user;
    DataHelpers.getTweets(username, (err, tweets, liked_tweet_ids) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({tweets: tweets, liked_tweet_ids: liked_tweet_ids});
      }
    });
  });

  tweetsRoutes.post("/", function(req, res) {

    const user = userHelper.generateRandomUser();
    user.name = req.session.user;
    const tweet = {
      id: generateId(),
      user: user,
      content: {
        text: req.body.text
      },
      created_at: Date.now(),
      likes: 0
    };

    DataHelpers.saveTweet(tweet, user.name, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json(tweet);
      }
    });
  });

  tweetsRoutes.put("/:id", function(req, res) {

    const id = req.params.id;
    const username = req.session.user;

    DataHelpers.likeToggle(id, username, (err, tweet_exists, made_by_user, summand=null) => {
      if(err) {
        res.status(500).json({ error: err.message });
      }
      else {
        if(tweet_exists) {
          if(made_by_user) {
            res.status(405).json({error: 'user cannot like their own tweets'});
          }
          else {
            res.status(201).json({summand: summand});
          }
        }
        else {
          res.status(404).json({ error: `there is no tweet with ID ${id}`});
        }
      }
    });
  });

  return tweetsRoutes;

};
