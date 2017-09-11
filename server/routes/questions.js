const express = require('express');
const console = require('console');
const router = express.Router();

const models = require('../models');

router.post('/new', (req, res) => {
  let question;

  if (req.body['kind'] === 'MultipleChoice') {
    question = new models.MultipleChoiceQuestion({
      choices: req.body['choices']
    });
  } else if (req.body['kind'] === 'ShortAnswer') {
    question = new models.ShortAnswerQuestion();
  } else res.status(500).send("'kind' must be one of 'ShortAnswer' or 'MultipleChoice'");

  question.text = req.body['text'];
  question.subject = req.body['subject'];
  question.answer = req.body['answer'];

  question.save(err => { if (err) throw err });

  res.send({ });
});

module.exports = router;
