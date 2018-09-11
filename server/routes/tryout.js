const express = require('express');
const console = require('console');

const models = require('../models');
const middleware = require('./middleware');

const router = express.Router();


/** Return a promise to the current tryout.
 */
function getCurrentTryout(req) {
  return models.Tryout.findById(req.params.id)
    .where('start').lt(new Date())
    .where('end').gt(new Date())
    .populate('questions.question');
}


/** Middleware that asserts there is a tryout and that the user has a tryout results model. */
function assertHasTryoutResult(req, res, next) {
  getCurrentTryout(req).then(tryout => {
    if (!tryout) { res.status(204).send({ reason: "no active tryout" }); return; }  // TODO: find status code
    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).then(tryoutResults => {
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
router.get('/:id', (req, res) => {
  getCurrentTryout(req).then(
    (tryout) => { res.send({ start: tryout.start, end: tryout.end }); },
    () => res.status(204).send());
});


function questionsAnswered(tryoutResult) {
  let i = 0;
  for (let update of tryoutResult.updates) {
    if (update.status != models.RoundResult.questionStatus.released) i++;
  }
  return i;
}

// tryoutResultsSchema.methods.currentResult = function() { return this.results[this.results.length - 1] };
// tryoutResultsSchema.methods.score = function() {
//   const scores = { total : { score: 0, answered: 0 } };
//   // Add up the score for each subject
//   for (let subject of game.SUBJECTS) {
//     const subjectResults = this.results.filter(result => result.question.subject === subject && result.status !== 'skipped');
//     let subjectScore = subjectResults.filter(result => result.status === 'correct').length * game.TRYOUT_CORRECT +
//       subjectResults.filter(question => question.status === 'incorrect').length * game.TRYOUT_INCORRECT;
//     scores[subject] = { score: subjectScore, answered: subjectResults.length };
//     scores.total.score += subjectScore;
//     scores.total.answered += subjectResults.length;
//   }
//   return scores;
// };

/** Get the next question for the user taking a tryout.
 *
 * This view first asserts that the user has a related tryout results
 * model. After that, the next question the user should complete is
 * determined and sent.
 */
router.post('/:id/next', middleware.assertUserAuthenticated, assertHasTryoutResult, (req, res) => {
  getCurrentTryout(req).then(tryout =>

    models.RoundResult.findOne({ user: req.user, round: tryout }).then(tryoutResult => {

      // Get the next question number
      let questionCount = tryoutResult.resultCount();
      let currentIndex = questionCount - 1;
      let currentResult = tryoutResult.currentResult();

      // Move to the next question if any of the following conditions are true
      if (questionCount === 0 ||  // This is the first question being accessed
          currentResult.status !== 'current') {

        // Check if there is another question
        if (currentIndex + 1 < tryout.questions.length) {

          // Get next question and push it to tryout results
          tryoutResult.results.push({ question: tryout.questions[++currentIndex].question, released: new Date(), status: 'current' });

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
        released: tryoutResult.currentResult().released
      }));

    })
  );
});


/** Skip the current question. */
router.post('/:id/skip', (req, res) => {
  getCurrentTryout().then((tryout) => {
    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).then((tryoutResult) => {

      // Get the question
      let currentResult = tryoutResult.currentResult();

      // Skip and send OK or fail because there are no questions
      if (tryoutResult.resultCount() > 0 && currentResult.status === 'current') {
        currentResult.status = 'skipped';
        tryoutResult.save().then(() => { res.send({}); });
      } else {
        res.status(409).send({ reason: 'question is not current' });
      }

    })
  });
});


/** Submit the answer to the current question. */
router.post('/:id/submit', middleware.assertUserAuthenticated, (req, res) => {
  getCurrentTryout().then((tryout) => {
    models.TryoutResults.findOne({ user: req.user, tryout: tryout }).populate('results.question').then((tryoutResult) => {

      let currentResult = tryoutResult.currentResult();

      // Check if the allotted time has passed
      if (Date.now() > currentResult.released.getTime() + currentResult.question.time * 1000) {
        currentResult.status = 'skipped';
        tryoutResult.save().then(() => res.status(409).send({ reason: 'time has expired' }));
        return;
      }

      // Check if we're trying to submit on a non-current question
      if (currentResult.status !== 'current') {
        res.status(409).send({ reason: 'question is not current' });
        return;
      }

      // Check if the answer is correct and save
      if (req.body['answer'] === currentResult.question.answer) currentResult.status = 'correct';
      else currentResult.status = 'incorrect';
      tryoutResult.save().then(() => res.send({}));

    })

  });
});


module.exports = router;
