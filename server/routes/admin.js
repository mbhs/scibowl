const express = require('express');
const console = require('console');

const models = require('../models');
const utils = require('../utils');
const middleware = require('./middleware');

const router = express.Router();


router.get('/tryouts', middleware.assertAdmin, (req, res) =>
  models.Tryout.find({ owner: req.team._id }).sort('-end').then(tryouts => Promise.all(tryouts.map(tryout =>
    models.TryoutResult.find({ round: tryout._id }).populate('user').populate('updates.question').then(results => {
      let summaries = [];
      for (let result of results) {
        summaries.push({
          user: utils.mask(result.user, ["name", "email", "year"]),
          started: result.updates[0].time,
          finished: result.updates.filter(update => update.status !== "released").length === tryout.questions.length,
          scores: result.score(tryout.correct, tryout.incorrect)
        });
      }
      let masked = utils.mask(tryout, ["start", "end", "title", "results"]);
      masked["results"] = summaries;
      return Promise.resolve(masked);
    })))).then(results => res.send(results)));

module.exports = router;
