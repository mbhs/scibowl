const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/scibowl');
console.log("Connected to database...");

const models = require('../models');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const NAME = "Montgomery Blair High School 2018 Tryout";
const START = new Date('September 11, 2018 0:00:00');
const END = new Date('November 19, 2018 23:59:00');

fs.readFile('tryout_questions.csv', (err, data) => {
  models.Team.findOne({ name: "MBHS" }).then(team => {
    const entries = parse(data);
    const tryout = models.Tryout({ owner: team, title: NAME, start: START, end: END, questions: []});

    for (const entry of entries) {
      const question = new models.MultipleChoiceQuestion({
        subject: entry[0],
        text: entry[1],
        difficulty: entry[7],
        choices: [
          {choice: 'W', text: entry[2]},
          {choice: 'X', text: entry[3]},
          {choice: 'Y', text: entry[4]},
          {choice: 'Z', text: entry[5]}
        ],
        answer: entry[6]
      });
      question.save();

      tryout.questions.push({question: question, time: +entry[8]});
    }

    tryout.save().catch(err => console.log(err));
  })
});
