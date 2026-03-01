const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields if they are provided in the request
        user.name = req.body.name || user.name;
        user.dob = req.body.dob || user.dob;
        user.rollNo = req.body.rollNo || user.rollNo;
        user.age = req.body.age || user.age;
        user.phone = req.body.phone || user.phone;
        user.gender = req.body.gender || user.gender;
        user.fatherName = req.body.fatherName || user.fatherName;
        user.motherName = req.body.motherName || user.motherName;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            dob: updatedUser.dob,
            rollNo: updatedUser.rollNo,
            age: updatedUser.age,
            phone: updatedUser.phone,
            gender: updatedUser.gender,
            fatherName: updatedUser.fatherName,
            motherName: updatedUser.motherName
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Change Password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // Check if current password matches
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save(); // The pre-save hook in User model will hash it automatically

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Account
// @route   DELETE /api/users/delete-account
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Security restriction: Don't allow the hardcoded admin to delete itself
        if (user.email === 'admin@gmail.com') {
            return res.status(403).json({ message: 'System Admin account cannot be deleted.' });
        }

        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'Account permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};