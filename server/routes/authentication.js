/*jslint node: true */
"use strict";

const express = require('express');
const routes  = express.Router();

// This function defines all routes concerned with login status.
module.exports = function makeAuthenticationFunctions(DataHelpers) {

  // This middleware function checks the login status of a user.
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

  // For checking login status -> GET /authentication
  routes.get('/', [userVerification], function(req, res) {
    res.status(200).json({
      username: req.session.user,
      is_logged_in: true
    });
  });

  // For registration -> PUT /authentication
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

  // For terminating a session -> PUT /authentication
  routes.put('/logout', function(req, res) {
    DataHelpers.logout(req.session.user, (err) => {
      if(err) {
        res.status(500).json({ error: err.message });
      }
      else {
        req.session = null;
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
