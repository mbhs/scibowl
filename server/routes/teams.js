const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const utils = require('../utils');
const validate = require('../validate');
const middleware = require('./middleware');


const router = express.Router();


router.post('/new', middleware.assertUserAuthenticated, (req, res) =>
  {
    const team = models.Team({ name: req.body['name'],
      students: { user: req.user._id, role: models.roles.captain } });
    team.save().then(() => res.status(200).send());
  }
);


router.get('/:id/code', middleware.assertHasRole(models.roles.captain), (req, res) => {
  res.send({ code: req.team.join_code });
});


router.post('/:id/code', middleware.assertHasRole(models.roles.captain), (req, res) => {
  req.team.join_code = Math.random().toString(36).replace("0.", "");
  req.team.save().then(() => res.status(200).send({ code: req.team.join_code }));
});


router.post('/join', middleware.assertUserAuthenticated, (req, res) =>
  models.Team.findOne({ join_code: req.body['code'] }).then(team => {
    if (!team) { res.status(404).send(); return }
    team.students.push({ user: req.user._id, role: models.roles.student });
    team.save().then(() => res.send());
  }, () => res.status())
);

module.exports = router;
