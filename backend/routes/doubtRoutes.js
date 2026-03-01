const express = require('express');
const { getDoubtsBySubject, createDoubt, answerDoubt, deleteAnswer, deleteDoubt } = require('../controllers/doubtController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:classId/:subjectFolder', protect, getDoubtsBySubject);
router.post('/', protect, createDoubt);
router.post('/:id/answers', protect, answerDoubt);
router.post('/:doubtId/answers/:answerId/replies', protect, replyToAnswer);
router.delete('/:id', protect, deleteDoubt);
router.delete('/:doubtId/answers/:answerId', protect, deleteAnswer);

module.exports = router;