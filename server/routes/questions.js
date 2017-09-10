const express = require('express');
const console = require('console');
const router = express.Router();

const models = require('../models');

router.post('/new', (req, res) => {
  // let question = new models.Question({
  //   name: req.body['name'],
  //   type: 0
  // });

  // task.save(err => {
  //   if (err) throw err;
  // });

  res.send({ });
});

module.exports = router;
