const express = require('express');
const router = express.Router();

const questions = require('./routes/questions');
router.use('/questions', questions);

const user = require('./routes/users');
router.use('/users', user);

const tryout = require('./routes/tryout');
router.use('/tryout', tryout);

module.exports = router;
