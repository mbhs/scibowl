const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const validate = require('../validate');

const router = express.Router();


router.post('/register', (req, res) => {

  /* Validate submitted credentials and information. */
  let username, password, firstName, lastName, email, year;
  try {
    username = validate.username(req.body['username']);
    password = validate.password(req.body['password']);
    firstName = validate.name(req.body['name']['first']);
    lastName = validate.name(req.body['name']['last']);
    email = validate.email(req.body['email']);
    year = validate.year(req.body['year']);
  } catch (err) {
    if (err instanceof validate.Error) {
      res.status(400).send({reason: err});
      return;
    } else throw err;
  }

  /* Search for existing users. */
  models.User.findOne({ username: username }).exec((err, existing) => {
    if (err) { console.error(err);
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
      password: password,
      name: { first: firstName, last: lastName },
      email: email,
      year: year
    });

    /* Register the user and set password. */
    models.User.register(user, password, (err, user) => {
      if (err) { console.error(err);
        res.status(500).send({reason: 'Server failed to register the account'});
        return;
      }

      /* Authenticate. */
      passport.authenticate('local')(req, res, () => res.status(200).send({}));

    });

  });
});


router.post('/login', (req, res) => {

  /* Parse posted data. */
  try {
    /* Only validation is necessary, as authentication is handled by the authentication method. */
    validate.username(req.body['username']);
    validate.password(req.body['password']);
  } catch (err) {
    if (err instanceof validate.ValidationError) {
      res.status(400).send({ reason: err.reason });
      return;
    } else throw err;
  }

  /* Try to log in. */
  passport.authenticate('local', (err, user, info) => {
    if (err) { console.error(err);
      res.status(500).send({ reason: 'server failed to query database' });
      return;
    }

    /* Check username. */
    if (!user) {
      res.status(401).send({ reason: 'incorrect username or password' });
      return;
    }

    /* Try login. */
    req.logIn(user, function (err) {
      if (err) { console.error(err);
        res.status(500).send({ reason: 'server failed to log in user' });
        return;
      }
      res.status(200).send({});
    });

  })(req, res);

});


router.get('/status', (req, res) => {

  if (req.user) res.status(200).send({
    username: req.user.username,
    name: {
      first: req.user.name.first,
      last: req.user.name.last
    },
    role: req.user.role
  });
  else res.status(401).send({});

});


router.post('/logout', (req, res) => {

  if (req.user) {
    req.logout();
    res.status(200).send({});
    return;
  }

  res.status(400).send({})

});


module.exports = router;
