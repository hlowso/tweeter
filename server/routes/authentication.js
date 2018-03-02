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
          res.redirect(303, '/');
        }
      });

    }
    else {
      res.redirect(303, '/');
    }
  };

// These are my own routes. They'll be used for login verification.

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
