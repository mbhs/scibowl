const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/scibowl', { useMongoClient: true });
console.log("Connected to database...");

const models = require('../models');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const START = new Date('September 16, 2017 10:00:00');
const END = new Date('September 20, 2017 00:00:00');

fs.readFile('tryout_questions.csv', (err, data) => {
  const entries = parse(data);
  const tryout = models.Tryout({ start: START, end: END, questions: [] });

  for (const entry of entries) {
    const question = new models.MultipleChoiceQuestion({
      subject: entry[0],
      text: entry[1],
      difficulty: entry[7],
      choices: [
        { choice: 'W', text: entry[2] },
        { choice: 'X', text: entry[3] },
        { choice: 'Y', text: entry[4] },
        { choice: 'Z', text: entry[5] }
      ],
      answer: entry[6]
    });
    question.save();

    tryout.questions.push({ question: question, time: +entry[8] });
  }

  tryout.save().catch(err => console.log(err));
});
