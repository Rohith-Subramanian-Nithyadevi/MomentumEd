const express = require('express');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all unverified Teachers and Advisors
router.get('/unverified', protect, restrictTo('admin'), async (req, res) => {
    try {
        const users = await User.find({ isVerified: false, role: { $in: ['teacher', 'advisor'] } })
                                .select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify a user
router.put('/verify/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = true;
        await user.save();
        res.json({ message: `${user.name} has been verified successfully.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;