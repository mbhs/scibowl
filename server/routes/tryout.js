const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const validate = require('../validate');

const router = express.Router();


router.get('/next', (req, res) => {

  if (req.user) {
    models.TryoutRound.findOne().then((err, tryout) =>
      models.TryoutResults.findOne({ user: req.user })
      // Access the user's tryout, or create it if it doesn't exist
        .then(result => result ? result : models.TryoutResults.create({ user: req.user, questions : [] }))
        .then(result => {
          // Get the question number of the next question
          const questionNumber = result.questions.length;

          // If their previous question is still active (they haven't submitted), mark it as skipped
          if (questionNumber > 0 && result.questions[questionNumber - 1].status === 'current') {
            result.questions[questionNumber - 1].status = 'skipped';
          }

          let returnData = { };
          // Get the next question
          if (questionNumber < tryout.questions.length) {
            const question = tryout.questions[questionNumber];
            // Mark that they've seen the question
            result.questions.push({ question: question, time: Date.now(), status: 'current' });
            returnData = { text: question.text, choices: question.choices };
          }

          result.save().then(() => res.send(returnData));
        })
    )
  }

});

router.post('/submit', (req, res) => {

  models.TryoutRound.findOne().then((err, tryout) =>
    models.TryoutResults.findOne({ user: req.user }).then(result => {
      const questionNumber = result.questions.length - 1;
      const question = result.questions[questionNumber];

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
