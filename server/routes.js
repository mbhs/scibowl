const express = require('express');
const router = express.Router();

const questions = require('./routes/question');
router.use('/question', questions);

module.exports = router;
