const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const validate = require('../validate');
const game = require('../game');

const router = express.Router();


function activeTryout() {
  return models.Tryout.findOne().where('start').lt(Date.now()).where('end').gt(Date.now()).populate('questions');
}


router.get('/active', (req, res) => {

  activeTryout().then(tryout => {
    res.send({ start: tryout.start, end: tryout.end });
  }, () => res.status(204).send());

});


router.post('/next', (req, res) => {

  if (!req.user) {
    res.status(401).send();
    return;
  }

  activeTryout().then(tryout =>
    models.TryoutResults.findOne({ user: req.user })
      // Access the user's tryout, or create it if it doesn't exist
      .then(result => result ? result : models.TryoutResults.create({ user: req.user, questions : [] }))
      .then(result => {
        const seen = result.questions.length;
        let question, time;

        // If their previous question is still active (they haven't submitted), mark it as skipped
        if (result.questions.length > 0 && result.questions[seen - 1].status === 'current'
          && Date.now() <= tryout.questions[seen - 1].time + result.questions[seen - 1].time ) {
          question = tryout.questions[seen - 1].question;
          time = result.questions[seen - 1].time;
        } else if (seen < tryout.questions.length) {
          question = tryout.questions[seen].question;
          time = Date.now();
          // Mark that they've seen the question
          result.questions.push({ question: question, time: time, status: 'current' });
        } else {
          res.status(204).send();
          return;
        }

        result.save().then(() => res.send({
          text: question.text,
          choices: question.choices,
          subject: question.subject,
          time: time,
          number: result.questions.length - 1
        }));
      })
  );

});

router.post('/skip', (req, res) => {

  if (!req.user) {
    res.status(401).send();
    return;
  }

  activeTryout().then(tryout =>
    models.TryoutResults.findOne({ user: req.user })
      // Access the user's tryout
      .then(result => {
        const question = result.questions[result.questions.length - 1];
        // If their previous question is still active (they haven't submitted), mark it as skipped
        if (result.questions.length > 0 && question.status === 'current') {
          question.status = 'skipped';
          result.save().then(() => res.send({ }));
        } else {
          res.status(409).send({ reason: 'question is not current' });
        }
      })
  );

});

router.post('/submit', (req, res) => {

  if (!req.user) {
    res.status(401).send();
    return;
  }

  activeTryout().then(tryout =>
    models.TryoutResults.findOne({ user: req.user }).then(result => {
      const questionNumber = result.questions.length - 1;
      const question = result.questions[questionNumber];

      if (Date > question.time + tryout.questions[questionNumber].time) {
        question.status = 'skipped';
        result.save().then(() => res.status(409).send({ reason: 'time has expired' }));
        return;
      }

      if (question.status !== 'current') {
        res.status(409).send({ reason: 'question is not current' });
        return;
      }

      if (req.body['answer'] === question.answer) {
        question.status = 'correct';
      } else {
        question.status = 'incorrect';
      }

      result.save().then(() => res.send({ }));
    })
  )

});

router.get('/results', (req, res) => {

  if (!req.user) {
    res.status(401).send({ });
    return;
  }

  models.Tryout.find().where('end').lt(Date.now()).sort('end').then(tryouts => {
    models.TryoutResults.find().where('tryout').in(tryouts).populate('tryout').then(results => {
      const participated = {};

      for (let result of results) {
        const scores = [];

        for (let subject of game.SUBJECTS) {
          scores[subject] = results.questions.filter(question => question.status === 'correct').length * game.TRYOUT_CORRECT +
            results.questions.filter(question => question.status === 'correct').length * game.TRYOUT_INCORRECT;
        }

        participated.push({
          start: result.tryout.start,
          end: result.tryout.end,
          scores: scores
        });
      }

      res.send(participated);
    });
  });

});


module.exports = router;
