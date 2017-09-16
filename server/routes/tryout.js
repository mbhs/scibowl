const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const validate = require('../validate');
const game = require('../game');

const router = express.Router();


/** Return a promise to the current tryout.
 *
 * TODO: The easier way to handle this is actually to just have a
 * boolean active variable. The selection can be changed on the
 * client side by an administrator.
 */
function getCurrentTryout() {
  return models.Tryout.findOne()
    .where('start').lt(Date.now())
    .where('end').gt(Date.now())
    .populate('questions');
}


/** Middleware that asserts the user has a tryout results model. */
function assertHasTryoutResult(req, res, next) {
  getCurrentTryout().then((tryout) => {
    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).then((tryoutResults) => {
      if (!tryoutResults) models.TryoutResults.create({ user: req.user, tryout: tryout }).then(() => {
        console.log("Created new tryout model!");
        next();
      });
      else {
        console.log("Already has tryout model.");
        next();
      }
    });
  });
}


/** Get the active tryout. */
router.get('/active', (req, res) => {
  getCurrentTryout().then(
    (tryout) => { res.send({ start: tryout.start, end: tryout.end }); },
    () => res.status(204).send());
});


/** Get the next question for the user taking a tryout.
 *
 * This view first asserts that the user has a related tryout results
 * model. After that, the next question the user should complete is
 * determined and sent.
 */
router.post('/next', assertHasTryoutResult, (req, res) => {

  // Check that the user is authenticated
  if (!req.user) { res.status(401).send(); return; }

  getCurrentTryout().then(tryout =>
    models.TryoutResults.findOne({ user: req.user }).then((tryoutResult) => {

      // Get the next question number
      let index = tryoutResult.questions.length - 1;
      let question;

      
      }

      tryoutResult.save().then(() => res.send({
        text: question.text,
        choices: question.choices,
        subject: question.subject,
        time: question.time,
        number: index + 1,
        released: tryoutResult.questions[index].released
      }));
    })
  );

});

router.post('/skip', (req, res) => {

  if (!req.user) {
    res.status(401).send();
    return;
  }

  getCurrentTryout().then(tryout =>
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

  getCurrentTryout().then(tryout =>
    models.TryoutResults.findOne({ user: req.user }).then(result => {
      const questionNumber = result.questions.length - 1;
      const question = result.questions[questionNumber];

      if (Date.now() >= question.time + tryout.questions[questionNumber].time * 1000) {
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
