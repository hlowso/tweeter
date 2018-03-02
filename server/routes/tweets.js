/*jslint node: true */
"use strict";

const userHelper    = require("../lib/util/user-helper");
const express        = require('express');
const tweetsRoutes   = express.Router();

// The only thing I modified in this file is line 43:
// I send the tweet object back to the client-side app
// so that it can be displayed immediately.

module.exports = function(DataHelpers) {

  const authentication = require('./authentication.js')(DataHelpers);
  tweetsRoutes.use(authentication.middleware);


  tweetsRoutes.get("/", function(req, res) {
    // res.json({x: 'hello'});
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(tweets);
      }
    });
  });

  tweetsRoutes.post("/", function(req, res) {
    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    const user = req.body.user ? req.body.user : userHelper.generateRandomUser();
    const tweet = {
      user: user,
      content: {
        text: req.body.text
      },
      created_at: Date.now(),
      likes: req.body.likes
    };

    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json(tweet);
      }
    });
  });

  tweetsRoutes.put("/tweets/:id", function(req, res) {

  });

  return tweetsRoutes;

};
