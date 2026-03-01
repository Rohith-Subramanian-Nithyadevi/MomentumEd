const express = require('express');
const { createClass, joinClass, getMyClasses } = require('../controllers/classController');
const { createClass, joinClass, getMyClasses, getClassById } = require('../controllers/classController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();


// Get the user's classes (available to everyone who is logged in)
router.get('/my-classes', protect, getMyClasses);

// Join a class using a code (available to students, teachers, and advisors)
router.post('/join', protect, joinClass);

// Create a class (ONLY available to Class Advisors)
router.post('/', protect, restrictTo('advisor'), createClass);
router.get('/:id', protect, getClassById);

module.exports = router;