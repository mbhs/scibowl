const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const utils = require('../utils');
const validate = require('../validate');
const middleware = require('./middleware');


const router = express.Router();


router.get('/', middleware.assertUserAuthenticated, (req, res) =>
  models.Team.findOne({ students: { user: req.user._id }}).then(team => {
    if (team) res.status(200).send(utils.mask(team, ["_id"]));
    else res.status(200).send();
  })
);

router.post('/new', middleware.assertUserAuthenticated, (req, res) =>
  {
    const team = models.Team({ name: req.params.name,
      students: { user: req.user._id, role: models.roles.captain } });
    team.save().then(() => res.status(200).send());
  }
);


router.post('/:id/code', middleware.assertHasRole(models.roles.captain), (req, res) => {
  req.team.code = Math.random().toString(36).replace("0.", "");
  req.team.save().then(() => res.status(200).send());
});


router.post('/join', middleware.assertUserAuthenticated, (req, res) =>
  models.Team.findOne({ code: req.params.code }).then(team => {
    team.students.push({ user: req.user._id, role: models.roles.student });
    team.save().then(() => res.status(404).send());
  }, () => res.status())
);

module.exports = router;
