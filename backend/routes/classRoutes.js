const express = require('express');

// 👇 Added updateTimetable and getClassStudents to the import list! 👇
const { 
    createClass, 
    joinClass, 
    getMyClasses, 
    getClassById, 
    uploadMaterial, 
    deleteClass, 
    deleteMaterial,
    updateTimetable,
    getClassStudents,
    removeUserFromClass
} = require('../controllers/classController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createClass);
router.post('/join', protect, joinClass);
router.get('/my-classes', protect, getMyClasses);

router.get('/:id', protect, getClassById);
router.delete('/:id', protect, deleteClass);

// 👇 NEW ADVISOR ROUTES 👇
router.put('/:id/timetable', protect, updateTimetable);
router.get('/:id/students', protect, getClassStudents);

router.post('/:id/materials', protect, uploadMaterial);
router.delete('/:id/materials/:materialId', protect, deleteMaterial);
router.delete('/:id/remove-user/:userId', protect, removeUserFromClass);
module.exports = router;