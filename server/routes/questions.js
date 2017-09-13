const express = require('express');
const console = require('console');
const router = express.Router();

const models = require('../models');

function update_question(question, data) {
  if (data['type'] === 'MultipleChoice') {
    data.choices = data;
  }

  question.text = data['text'];
  question.subject = data['subject'];
  question.answer = data['answer'];
}

router.post('/new', (req, res) => {
  let question;

  if (req.body['type'] === 'MultipleChoice') {
    question = new models.MultipleChoiceQuestion();
  } else if (req.body['type'] === 'ShortAnswer') {
    question = new models.ShortAnswerQuestion();
  } else res.status(500).send("'type' must be one of 'ShortAnswer' or 'MultipleChoice'");

  update_question(question, req.body);
  question.save(err => { if (err) throw err });

  res.send({ id: question._id });
});

router.post('/:id/edit', (req, res) => {
  models.Question.findById(req.params.id, (err, question) => {
    update_question(question, req.body);
    question.save(err => { if (err) throw err });

    res.send({ });
  });
});

router.get('/:id', (req, res) => {
  models.Question.findById(req.params.id, (err, question) => {
    res.send(question);
  });
});

module.exports = router;
