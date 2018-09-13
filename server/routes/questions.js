const express = require('express');
const console = require('console');
const router = express.Router();

const models = require('../models');
const middleware = require('./middleware');
const game = require('../game');


router.post('/new', middleware.assertStudent, (req, res) => {

  // Create a question with arbitrary type
  let question;
  if (req.body['kind'] === "MultipleChoiceQuestion") {
    question = new models.MultipleChoiceQuestion();
  } else if (req.body['kind'] === "ShortAnswerQuestion") {
    question = new models.ShortAnswerQuestion();
  } else {
    res.status(400).send({ reason: "invalid question type" });
    return;
  }

  let questionData = req.body;
  questionData["owner"] = req.team._id;
  questionData["author"] = req.user._id;

  // Update and save the question
  question.update(questionData);
  question.save().then(() => res.send({ id: question._id }));

});


router.post('/:id', middleware.assertAdmin, (req, res) => {

  // Find and update the question
  models.Question.findById(req.params.id).then(question => {
    question.update(req.body)
    question.save().then(() => res.send());
  }, () => res.status(404).send({ reason: "no question found" }));

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
  }, () => res.status(404).send({ reason: "no question found" }));

});

module.exports = router;
