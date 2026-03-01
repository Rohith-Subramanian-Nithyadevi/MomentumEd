const ClassGroup = require('../models/ClassGroup');
const User = require('../models/User');

// Helper function to generate a random 6-character code
const generateGroupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Create a new class (Advisors only)
// @route   POST /api/classes
exports.createClass = async (req, res) => {
    try {
        const { className, subject } = req.body;

        // Generate a unique 6-character group code
        let groupCode = generateGroupCode();
        // Ensure it's completely unique in the database
        while (await ClassGroup.findOne({ groupCode })) {
            groupCode = generateGroupCode();
        }

        const newClass = await ClassGroup.create({
            className,
            subject,
            groupCode,
            advisor: req.user._id
        });

        // Add this class to the Advisor's enrolled list
        await User.findByIdAndUpdate(req.user._id, {
            $push: { enrolledClasses: newClass._id }
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a class using a group code
// @route   POST /api/classes/join
exports.joinClass = async (req, res) => {
    try {
        // We now accept an optional teacherSubject from the frontend
        const { groupCode, teacherSubject } = req.body; 
        const classGroup = await ClassGroup.findOne({ groupCode: groupCode.toUpperCase() });

        if (!classGroup) {
            return res.status(404).json({ message: 'Invalid Group Code.' });
        }

        const user = await User.findById(req.user._id);
        if (user.enrolledClasses.includes(classGroup._id)) {
            return res.status(400).json({ message: 'You are already in this class.' });
        }

        // Logic based on Role
        if (req.user.role === 'student') {
            classGroup.students.push(req.user._id);
            
        } else if (req.user.role === 'teacher') {
            // Force teachers to provide a subject so we can create their folder
            if (!teacherSubject) {
                return res.status(400).json({ message: 'Teachers must specify a subject to create their folder.' });
            }
            classGroup.teachers.push({ user: req.user._id, subjectName: teacherSubject });
            
        } else if (req.user.role === 'advisor') {
            // If an advisor joins another class, give them a generic folder
            classGroup.teachers.push({ user: req.user._id, subjectName: 'Advisor General' });
        }

        await classGroup.save();

        user.enrolledClasses.push(classGroup._id);
        await user.save();

        res.status(200).json({ message: `Successfully joined ${classGroup.className}!`, classGroup });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all classes the user is enrolled in/managing
// @route   GET /api/classes/my-classes
exports.getMyClasses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('enrolledClasses');
        res.status(200).json(user.enrolledClasses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};