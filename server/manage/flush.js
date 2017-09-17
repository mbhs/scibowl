const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/scibowl', { useMongoClient: true });
console.log("Connected to database...");

const models = require('../models');


models.TryoutResults.find().then((tryoutResults) => {
  for (let tryoutResult of tryoutResults) {
    tryoutResult.delete();
  }
});

models.Tryout.find().then((tryouts) => {
  for (let tryout of tryouts) {
    tryout.delete();
  }
});
