const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/scibowl');
console.log("Connected to database...");

const models = require('../models');


models.RoundResult.find().then((tryoutResults) => {
  for (let tryoutResult of tryoutResults) {
    tryoutResult.delete();
  }
});

models.Tryout.find().then((tryouts) => {
  for (let tryout of tryouts) {
    tryout.delete();
  }
});
