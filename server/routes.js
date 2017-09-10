const express = require('express');
const console = require('console');
const router = express.Router();

const models = require('./models');


// router.get('/', (req, res) => {
//   Task.find({}, (err, tasks) => {
//     if (err) throw err;
//     res.send(tasks);
//   });
// });


module.exports = router;
