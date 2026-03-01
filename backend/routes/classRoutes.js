const express = require('express');

// We are importing EVERYTHING your routes need right here:
const { 
    createClass, 
    joinClass, 
    getMyClasses, 
    getClassById,    // 👈 Added this!
    uploadMaterial, 
    deleteClass, 
    deleteMaterial   // 👈 And kept this!
} = require('../controllers/classController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Class Management Routes
router.post('/', protect, createClass);
router.post('/join', protect, joinClass);
router.get('/my-classes', protect, getMyClasses);

// Class Details & Deletion
router.get('/:id', protect, getClassById);
router.delete('/:id', protect, deleteClass);

// Material Routes
router.post('/:id/materials', protect, uploadMaterial);
router.delete('/:id/materials/:materialId', protect, deleteMaterial);

module.exports = router;