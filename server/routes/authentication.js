/*jslint node: true */
"use strict";

const express = require('express');
const routes  = express.Router();

module.exports = function makeAuthenticationFunctions(DataHelpers) {

  const userVerification = (req, res, next) => {
    const username = req.session.user;
    if(username) {
      DataHelpers.isLoggedIn(username, (err, answer) => {
        if(err) {
          res.status(500).json({ error: err.message });
        }
        else if(answer) {
          next();
        }
        else {
          res.json({
            username: username,
            is_logged_in: false
          });
        }
      });
    }
    else {
      res.json({
        username: undefined,
        is_logged_in: false
      });
    }
  };

// These are my own routes. They'll be used for login verification.

  routes.get('/', [userVerification], function(req, res) {
    res.status(200).json({
      username: req.session.user,
      is_logged_in: true
    });
  });

  routes.put('/', function(req, res) {
    const valid_username = req.body.user;
    req.session.user = valid_username;

    DataHelpers.login(valid_username, (err, user_exists) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } 
      else if(!user_exists) {
        res.status(201).json({name: valid_username});
      }
      else {
        res.status(200).json({name: valid_username});
      }
    });
  });

  routes.put('/logout', function(req, res) {
    DataHelpers.logout(req.session.user, (err) => {
      if(err) {
        res.status(500).json({ error: err.message });
      }
      else {
        res.status(201).send();
      }
    });
  });

  return {
    middleware: [
      userVerification
    ],
    routes: routes
  };
};
