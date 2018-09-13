const express = require('express');
const router = express.Router();

const questions = require('./routes/questions');
router.use('/questions', questions);

const rounds = require('./routes/rounds');
router.use('/rounds', rounds);

const users = require('./routes/users');
router.use('/users', users);

const teams = require('./routes/teams');
router.use('/teams', teams);

const tryout = require('./routes/tryout');
router.use('/tryout', tryout);

const admin = require('./routes/admin');
router.use('/admin', admin);

module.exports = router;
