const express = require('express');
const router = express.Router();

const questions = require('./routes/questions');
router.use('/question', questions);

const user = require('./routes/users');
router.use('/users', user);

module.exports = router;
