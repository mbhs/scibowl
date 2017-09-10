const express = require('express');
const passport = require('passport');
const console = require('console');
const validator = require('validator');

const models = require('../models');

const router = express.Router();


/** Register a user. */
router.post('/register', (req, res) => {

  let username, password, firstName, lastName, email;

  

  models.User.register(new models.User({
    username: req.body.username,

  }))
});

router.post('/login', (req, res) => {

});

module.exports = router;
