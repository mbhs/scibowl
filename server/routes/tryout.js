const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const validate = require('../validate');

const router = express.Router();


router.post('/next', (req, res) => {

  if (!req.user) {
    res.status(401).send({ });
    return;
  }

  models.TryoutRound.findOne().populate('questions').then(tryout =>
    models.TryoutResults.findOne({ user: req.user })
      // Access the user's tryout, or create it if it doesn't exist
      .then(result => result ? result : models.TryoutResults.create({ user: req.user, questions : [] }))
      .then(result => {
        // Todo: next question if current time has expired
        // If their previous question is still active (they haven't submitted), mark it as skipped
        if (result.questions.length > 0 && result.questions[result.questions.length - 1].status === 'current') {
          const question = tryout.questions[result.questions.length - 1];
          res.send({ text: question.text, choices: question.choices });
        } else if (result.questions.length < tryout.questions.length) {
          const question = tryout.questions[result.questions.length];
          // Mark that they've seen the question
          result.questions.push({ question: question, time: Date.now(), status: 'current' });
          result.save().then(() => res.send({ text: question.text, choices: question.choices }));
        } else {
          res.send({ });
        }
      })
  );

});

router.post('/skip', (req, res) => {

  if (!req.user) {
    res.status(401).send({ });
    return;
  }

  models.TryoutRound.findOne().populate('questions').then(tryout =>
    models.TryoutResults.findOne({ user: req.user })
      // Access the user's tryout
      .then(result => {
        // If their previous question is still active (they haven't submitted), mark it as skipped
        if (result.questions.length > 0 && result.questions[result.questions.length - 1].status === 'current') {
          result.questions[result.questions.length - 1].status = 'skipped';
          result.save().then(() => res.send({ }));
        } else {
          res.status(409).send({ reason: 'question is not current' });
        }
      })
  );

});

router.post('/submit', (req, res) => {

  models.TryoutRound.findOne().populate('questions').then(tryout =>
    models.TryoutResults.findOne({ user: req.user }).then(result => {
      const questionNumber = result.questions.length - 1;
      const question = result.questions[questionNumber];

      // Todo: Check time

      if (question.status !== 'current') {
        res.status(409).send({ reason: 'question is not current' });
      }

      if (req.body['answer'] === question.answer) {
        result.questions[questionNumber].status = 'correct';
      } else {
        result.questions[questionNumber].status = 'incorrect';
      }

      result.save().then(() => res.send({ }));
    })
  )

});


module.exports = router;
