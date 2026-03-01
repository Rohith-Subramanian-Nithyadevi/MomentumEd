const express = require('express');
const { updateUserProfile, getUserProfile, changePassword, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;