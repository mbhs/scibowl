const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const validate = require('../validate');

const router = express.Router();


/** Register a user. */
router.post('/register', (req, res) => {

  /* Validate submitted credentials and information. */
  let username, password, firstName, lastName, email;
  try {
    username = validate.username(req.body['username']);
    password = validate.password(req.body['password']);
    firstName = validate.name(req.body['firstName']);
    lastName = validate.name(req.body['lastName']);
    email = validate.email(req.body['email']);
  } catch (err) {
    if (err instanceof validate.Error) {
      res.status(400).send({reason: err});
    } else throw err;
  }

  /* Search for existing users. */
  models.User.findOne({ username: username }).exec((err, existing) => {
    if (err) {
      console.error(err);
      res.status(500).send({reason: 'Server failed to query database'});
      return;
    }

    /* Check if user exists. */
    if (existing !== null) {
      res.status(400).send({reason: 'Username is already taken'});
      return;
    }

    /* Create user. */
    let user = new models.User({
      username: username,
      name: { first: firstName, last: lastName },
      email: email,
    });

    /* Register the user and set password. */
    models.User.register(user, password, (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send({reason: 'Server failed to register the account'});
        return;
      }

      /* Authenticate. */
      passport.authenticate('local')(req, res, () => {
        res.status(200).send({});
      });

    });

  });
});


router.post('/login', (req, res) => {

});

module.exports = router;
