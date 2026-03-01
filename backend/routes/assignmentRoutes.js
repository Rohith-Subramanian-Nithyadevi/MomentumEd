const express = require('express');
const { getAssignmentsBySubject, createAssignment, submitAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:classId/:subjectFolder', protect, getAssignmentsBySubject);
router.post('/', protect, createAssignment);
router.post('/:id/submit', protect, submitAssignment);
router.delete('/:id', protect, deleteAssignment);

module.exports = router;