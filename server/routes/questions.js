const express = require('express');
const console = require('console');
const router = express.Router();

const models = require('../models');
const game = require('../game');


router.post('/new', (req, res) => {

  if (!req.user || req.user.role < models.roles.staff) return;

  // Create a question with arbitrary type
  let question;
  if (req.body['type'] === game.MC) {
    question = new models.MultipleChoiceQuestion();
  } else if (req.body['type'] === game.SA) {
    question = new models.ShortAnswerQuestion();
  } else res.status(500).send("question type must be one of " + [game.MC, game.SA].join(", "));

  // Update and save the question
  question.update(req.body);
  question.save(err => { if (err) throw err });
  res.send({ id: question._id });

});


router.post('/:id/edit', (req, res) => {

  if (!req.user || req.user.role < models.roles.staff) return;

  // Find and update the question
  models.Question.findById(req.params.id, (err, question) => {
    question.update(req.body);
    question.save(err => { if (err) throw err });
    res.send({});
  });

});


router.get('/:id', (req, res) => {

  if (!req.user || req.user.role < models.roles.staff) return;

  // Find and send the question
  models.Question.findById(req.params.id, (err, question) => {
    res.send(question);
  });

});

module.exports = router;
