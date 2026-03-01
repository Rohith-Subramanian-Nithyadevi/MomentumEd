const express = require('express');

// 👇 We only need this ONE import line 👇
const { createClass, joinClass, getMyClasses, getClassById,deleteClass, uploadMaterial} = require('../controllers/classController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Get the user's classes 
router.get('/my-classes', protect, getMyClasses);

// Join a class using a code 
router.post('/join', protect, joinClass);

// Create a class 
router.post('/', protect, restrictTo('advisor'), createClass);

// Get a specific class by ID
router.get('/:id', protect, getClassById);
router.delete('/:id', protect, restrictTo('advisor', 'admin'), deleteClass);
router.post('/:id/materials', protect, restrictTo('teacher'), uploadMaterial);
router.delete('/:id/materials/:materialId', protect, deleteMaterial);

module.exports = router;