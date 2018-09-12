const express = require('express');
const console = require('console');

const models = require('../models');
const utils = require('../utils');
const middleware = require('./middleware');

const router = express.Router();


/** Return a promise to the current tryout.
 */
function assertTryoutAuthorized(req, res, next) {
  return models.Tryout.findOne({ _id: req.params.id })
    .populate('questions.question').then(tryout => {
      if (!tryout ||
        tryout.start > new Date() ||
        tryout.end < new Date() ||
        !tryout.owner.equals(req.team._id)) {
        res.status(404).send({ reason: "no tryout found"});
        return;
      }
      req.tryout = tryout;
      next();
    });
}


/** Middleware that asserts there is a tryout and that the user has a tryout results model. */
function assertHasTryoutResult(req, res, next) {
  models.TryoutResult.findOne({ user: req.user._id, round: req.tryout }).then(tryoutResults => {
    if (!tryoutResults) models.TryoutResult.create({ user: req.user, round: req.tryout }).then(() => next());
    else next();
  });
}


/** List active tryouts. */
router.get('/', middleware.assertHasRole(models.roles.student), (req, res) => {
  models.Tryout.find({
    owner: req.team._id,
    start: { $lt: new Date() },
    end: { $gt: new Date() }
  }).then(tryouts => res.send(tryouts.map(tryout => utils.mask(tryout, ["_id", "start", "end", "title"]))));
});

/** Get the information about a tryout. */
router.get('/:id', middleware.assertHasRole(models.roles.student), assertTryoutAuthorized, (req, res) => {
  const masked = utils.mask(req.tryout, ['start', 'end', '_id', 'title']);
  masked['numQuestions'] = req.tryout.questions.length;
  models.TryoutResult.findOne({user: req.user._id, round: req.tryout}).then(tryoutResults => {
    masked['started'] = tryoutResults !== null;
    res.status(200).send(masked);
  });
});

/** Get the next question for the user taking a tryout.
 *
 * This view first asserts that the user has a related tryout results
 * model. After that, the next question the user should complete is
 * determined and sent.
 */
router.post('/:id/next', middleware.assertHasRole(models.roles.student), assertTryoutAuthorized, assertHasTryoutResult, (req, res) => {
  models.TryoutResult.findOne({ user: req.user, round: req.tryout }).then(tryoutResult => {

    // Get the next question number
    let questionCount = tryoutResult.questionsReleased();
    let currentIndex = questionCount - 1;
    let lastUpdate = tryoutResult.lastUpdate();

    // Move to the next question if any of the following conditions are true
    if (questionCount === 0 ||  // This is the first question being accessed
      lastUpdate.status !== "released") {

      // Check if there is another question
      if (currentIndex + 1 < req.tryout.questions.length) {

        // Get next question and push it to tryout updates
        tryoutResult.updates.push({
          question: req.tryout.questions[++currentIndex].question,
          time: new Date(),
          status: "released" });

        // No more questions
      } else {
        res.status(204).send();
        return;
      }

    }

    const currentQuestion = req.tryout.questions[currentIndex];

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
});


/** Skip the current question. */
router.post('/:id/skip', middleware.assertHasRole(models.roles.student), assertTryoutAuthorized, assertHasTryoutResult, (req, res) => {
  models.TryoutResult.findOne({ user: req.user, round: req.tryout }).then(tryoutResult => {

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


/** Submit the answer to the current question. */
router.post('/:id/submit', middleware.assertHasRole(models.roles.student), assertTryoutAuthorized, assertHasTryoutResult, (req, res) => {
  models.TryoutResult.findOne({ user: req.user, round: req.tryout }).populate('updates.question').then(tryoutResult => {

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


module.exports = router;
