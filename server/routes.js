const express = require('express');
const router = express.Router();

const question = require('./routes/question');
router.use('/question', question);

module.exports = router;
