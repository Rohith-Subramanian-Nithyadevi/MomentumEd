const express = require('express');
const { getDoubtsBySubject, createDoubt, answerDoubt } = require('../controllers/doubtController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:classId/:subjectFolder', protect, getDoubtsBySubject);
router.post('/', protect, createDoubt);
router.post('/:id/answers', protect, answerDoubt);

module.exports = router;