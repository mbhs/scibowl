const express = require('express');
const passport = require('passport');
const console = require('console');

const models = require('../models');
const game = require('../game');
const middleware = require('./middleware');

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


/** Middleware that asserts there is a tryout and that the user has a tryout results model. */
function assertHasTryoutResult(req, res, next) {
  getCurrentTryout().then((tryout) => {
    if (!tryout) { res.status(204).send({ reason: "no active tryout" }); return; }  // TODO: find status code
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
router.post('/next', middleware.assertUserAuthenticated, assertHasTryoutResult, (req, res) => {
  getCurrentTryout().then((tryout) =>

    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).then((tryoutResult) => {

      // Get the next question number
      let questionCount = tryoutResult.questionCount();
      let currentIndex = questionCount - 1;
      let currentQuestion = tryoutResult.currentQuestion();
      let currentAllowedTime = currentQuestion.time * 1000;
      let nextQuestion;

      // Move to the next question if any of the following conditions are true
      if (questionCount === 0 ||  // This is the first question being accessed
          currentQuestion.status !== 'current' ||  // The current question is marked as current
          Date.now() > currentQuestion.released + currentAllowedTime) {  // Out of time

        // Check if there is another question
        if (currentIndex + 1 < tryout.questions.length) {

          // Get next question and push it to tryout results
          nextQuestion = tryout.questions[currentIndex + 1].question;
          tryoutResult.questions.push({ question: nextQuestion, released: new Date(), status: 'current' });

        // No more questions
        } else {
          res.status(204).send();
          return;
        }

      }

      // Save and send the question to the user
      tryoutResult.save().then(() => res.send({
        text: nextQuestion.text,
        choices: nextQuestion.choices,
        subject: nextQuestion.subject,
        time: nextQuestion.time,
        number: currentIndex + 1,
        released: tryoutResult.questions[index].released
      }));

    })
  );
});


/** Skip the current question. */
router.post('/skip', (req, res) => {
  getCurrentTryout().then((tryout) => {
    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).then((tryoutResult) => {

      // Get the question
      let currentQuestion = tryoutResult.currentQuestion();

      // Skip and send 200 or fail because there are no questions
      if (tryoutResult.questions.length > 0 && currentQuestion.status === 'current') {
        currentQuestion.status = 'skipped';
        tryoutResult.save().then(() => { res.send({}); });
      } else {
        res.status(409).send({ reason: 'question is not current' });
      }

    })
  });
});


/** Submit the answer to the current question. */
router.post('/submit', middleware.assertUserAuthenticated, (req, res) => {
  getCurrentTryout().then((tryout) => {
    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).then((tryoutResult) => {

      let currentQuestion = tryoutResult.currentQuestion();

      // Check if the allotted time has passed
      if (Date.now() > currentQuestion.released + currentQuestion.time * 1000) {
        currentQuestion.status = 'skipped';
        tryoutResult.save().then(() => res.status(409).send({ reason: 'time has expired' }));
        return;
      }

      // Check if we're trying to submit on a non-current question
      if (currentQuestion.status !== 'current') {
        res.status(409).send({ reason: 'question is not current' });
        return;
      }

      // Check if the answer is correct and save
      if (req.body['answer'] === currentQuestion.answer) currentQuestion.status = 'correct';
      else currentQuestion.status = 'incorrect';
      tryoutResult.save().then(() => res.send({}));

    })

  });
});

/** Get the results from all users */
router.get('/results', middleware.assertUserAuthenticated, (req, res) => {
  getCurrentTryout().then((tryout) => {
    models.TryoutResults.find({ tryout: tryout }).then((tryoutResults) => {

      // Loop through scores
      const participated = {};
      for (let result of tryoutResults) {
        const scores = [];

        // Add up the score for each subject
        for (let subject of game.SUBJECTS) {
          scores[subject] = tryoutResults.questions.filter(question => question.status === 'correct').length * game.TRYOUT_CORRECT +
            tryoutResults.questions.filter(question => question.status === 'correct').length * game.TRYOUT_INCORRECT;
        }

        participated.push({
          start: result.tryout.start,
          end: result.tryout.end,
          scores: scores
        });
      }

      // Send
      res.send(participated);

    });
  });
});


module.exports = router;
