const express = require('express');
const router = express.Router();

const questions = require('./routes/questions');
router.use('/questions', questions);

const user = require('./routes/users');
router.use('/users', user);

const team = require('./routes/teams');
router.use('/teams', team);

const tryout = require('./routes/tryout');
router.use('/tryout', tryout);

const admin = require('./routes/admin');
router.use('/admin', admin);

module.exports = router;
