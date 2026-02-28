const express = require('express');
const { createDoubt, getDoubts, answerDoubt } = require('../controllers/doubtController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply the 'protect' middleware to all routes below
router.route('/')
    .post(protect, createDoubt)
    .get(protect, getDoubts);

router.route('/:id/answers')
    .post(protect, answerDoubt);

// Important: You must export the router so server.js can use it!
module.exports = router;