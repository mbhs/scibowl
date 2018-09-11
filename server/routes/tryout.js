const express = require('express');
const console = require('console');

const models = require('../models');
const utils = require('../utils');
const middleware = require('./middleware');

const router = express.Router();


/** Return a promise to the current tryout.
 */
function getCurrentTryout(req) {
  if (!req.user) return None;
  return models.Tryout.findOne()
    .where('start').lt(new Date())
    .where('end').gt(new Date())
    .populate('questions.question');
}


/** Middleware that asserts there is a tryout and that the user has a tryout results model. */
function assertHasTryoutResult(req, res, next) {
  getCurrentTryout(req).then(tryout => {
    if (!tryout) { res.status(204).send({ reason: "no active tryout" }); return; }  // TODO: find status code
    models.TryoutResult.findOne({ user: req.user._id, round: tryout }).then(tryoutResults => {
      if (!tryoutResults) models.TryoutResult.create({ user: req.user, round: tryout }).then(() => next());
      else next();
    });
  });
}


/** Get the active tryout. */
router.get('/', (req, res) =>
  getCurrentTryout(req).then(
    tryout => {
      const masked = utils.mask(tryout, ['start', 'end', '_id']);
      masked['numQuestions'] = tryout.questions.length;
      models.TryoutResult.findOne({ user: req.user._id, round: tryout }).then(tryoutResults => {
        masked['started'] = tryoutResults !== undefined;
        res.status(200).send(masked);
      });
    }, () => res.status(204).send()
));


/** Get the next question for the user taking a tryout.
 *
 * This view first asserts that the user has a related tryout results
 * model. After that, the next question the user should complete is
 * determined and sent.
 */
router.post('/:id/next', middleware.assertUserAuthenticated, assertHasTryoutResult, (req, res) => {
  getCurrentTryout(req).then(tryout =>

    models.TryoutResult.findOne({ user: req.user, round: tryout }).then(tryoutResult => {

      // Get the next question number
      let questionCount = tryoutResult.questionsReleased();
      let currentIndex = questionCount - 1;
      let lastUpdate = tryoutResult.lastUpdate();

      // Move to the next question if any of the following conditions are true
      if (questionCount === 0 ||  // This is the first question being accessed
        lastUpdate.status !== "released") {

        // Check if there is another question
        if (currentIndex + 1 < tryout.questions.length) {

          // Get next question and push it to tryout updates
          tryoutResult.updates.push({
            question: tryout.questions[++currentIndex].question,
            time: new Date(),
            status: "released" });

        // No more questions
        } else {
          res.status(204).send();
          return;
        }

      }

      const currentQuestion = tryout.questions[currentIndex];

      // Save and send the question to the user
      tryoutResult.save().then(() => res.send({
        text: currentQuestion.question.text,
        choices: currentQuestion.question.choicesMap(),
        subject: currentQuestion.question.subject,
        time: currentQuestion.time,
        number: currentIndex + 1,
        released: tryoutResult.lastUpdate().time
      }));

    })
  );
});


/** Skip the current question. */
router.post('/:id/skip', (req, res) => {
  getCurrentTryout(req).then((tryout) => {
    models.TryoutResult.findOne({ user: req.user, round: tryout }).then(tryoutResult => {

      // Get the question
      let lastUpdate = tryoutResult.lastUpdate();

      // Skip and send OK or fail because there are no questions
      if (tryoutResult.questionsReleased() > 0 && lastUpdate.status === 'released') {
        // The user has skipped the question
        tryoutResult.updates.push({
          question: lastUpdate.question,
          time: new Date(),
          status: "skipped" });
        tryoutResult.save().then(() => { res.send(); });
      } else {
        res.status(409).send({ reason: 'question is not current' });
      }

    })
  });
});


/** Submit the answer to the current question. */
router.post('/:id/submit', middleware.assertUserAuthenticated, (req, res) => {
  getCurrentTryout(req).then((tryout) => {
    models.TryoutResult.findOne({ user: req.user, round: tryout }).populate('updates.question').then(tryoutResult => {

      let lastUpdate = tryoutResult.lastUpdate();

      // Check if we're trying to submit on a non-current question
      if (lastUpdate.status !== 'released') {
        res.status(409).send({ reason: 'question is not current' });
        return;
      }

      // Check if the allotted time has passed
      if (Date.now() > lastUpdate.time.getTime() + lastUpdate.question.time * 1000) {
        // The user has skipped the question
        tryoutResult.updates.push({
          question: lastUpdate.question,
          time: new Date(),
          status: "skipped" });
        tryoutResult.save().then(() => res.status(409).send({ reason: 'time has expired' }));
        return;
      }

      // Check if the answer is correct and save
      tryoutResult.updates.push({
        question: lastUpdate.question,
        time: new Date(),
        status: req.body['answer'] === lastUpdate.question.answer ? 'correct' : 'incorrect' });
      tryoutResult.save().then(() => res.send());

    })

  });
});


module.exports = router;
