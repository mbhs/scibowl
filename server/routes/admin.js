const express = require('express');
const console = require('console');

const models = require('../models');
const middleware = require('./middleware');

const router = express.Router();


router.get('/tryouts', middleware.assertAdmin, (req, res) =>
  models.Tryout.find({}).sort('-end').then(tryouts => Promise.all(tryouts.map(tryout =>
    models.TryoutResults.find({ tryout: tryout }).populate('user').populate('results.question').then(results => {
      let summaries = [];
      for (let result of results) {
        summaries.push({
          name: result.user.name,
          year: result.user.year,
          started: result.results[0].released,
          scores: result.score()
        });
      }
      return Promise.resolve({ start: tryout.start, end: tryout.end, results: summaries });
    })))).then(results => res.send(results)));

module.exports = router;
