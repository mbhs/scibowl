const express = require('express');
const console = require('console');
var format = require('dateformat');

const models = require('../models');
const utils = require('../utils');
const middleware = require('./middleware');

const router = express.Router();


router.get('/', middleware.assertHasRole(models.roles.student), (req, res) => {
  let query;
  if (req.team.user_role >= models.roles.student) query = { author: req.user._id };
  if (req.team.user_role >= models.roles.captain) query = { owner: req.team._id };
  models.Round.find(query).populate("author").then(rounds => res.send(
    rounds.map(round => {
      let masked = utils.mask(round, ["owner", "author", "kind", "title", "_id"]);
      masked["numQuestions"] = round.questions.length;
      return masked;
    })
  ));
});


router.get('/:id', middleware.assertHasRole(models.roles.student), (req, res) =>
    models.Round.findOne({ _id: req.params.id }).populate("questions.question").then(round => {
      if (!(req.team.user_role >= models.roles.student && round.author.equals(req.user._id) ||
        req.team.user_role >= models.roles.captain && round.owner.equals(req.team._id))) {
        res.status(401).send({ reason: "unauthorized to access round" });
        return;
      }
      res.send(round);
    }, () => res.status(404).send({ reason: "no round found" })));


// TODO: Make this work properly for tryouts

router.post('/new', middleware.assertAdmin, (req, res) => {

  let round = new models.Round();
  round.update(req.body);
  round.save().then(() => res.send({ id: round._id }), () => res.status(400).send());

});


router.post('/:id', middleware.assertAdmin, (req, res) => {

  // Find and update the question
  models.Round.findById(req.params.id).then(round => {
    round.update(req.body);
    round.save().then(() => res.send({id: round._id}), () => res.status(400).send());
  }, () => res.status(404).send({ reason: "no round found" }));

});


router.get('/:id', middleware.assertAdmin, (req, res) => {

  // Find and send the question
  models.Question.findById(req.params.id).then(question => {

    if (!req.user && question.circulation > models.roles.public ||
      req.user && question.circulation > req.user.role) {
      res.status(401).send({});
      return;
    }

    res.send(question);
  }, () => res.status(404).send({ reason: "no round found" }));

});


module.exports = router;
