const Assignment = require('../models/Assignment');

// @desc    Get assignments for a specific subject folder
// @route   GET /api/assignments/:classId/:subjectFolder
exports.getAssignmentsBySubject = async (req, res) => {
    try {
        const { classId, subjectFolder } = req.params;
        const assignments = await Assignment.find({ classGroup: classId, subjectFolder })
            .populate('createdBy', 'name role')
            .populate('submissions.student', 'name rollNo email')
            .sort({ dueDate: 1 }); // Sort by upcoming due dates
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
exports.createAssignment = async (req, res) => {
    try {
        const { classId, subjectFolder, title, description, referenceUrl, dueDate } = req.body;
        const assignment = await Assignment.create({
            classGroup: classId,
            subjectFolder,
            title,
            description,
            referenceUrl,
            dueDate,
            createdBy: req.user._id
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit work for an assignment (Students)
// @route   POST /api/assignments/:id/submit
exports.submitAssignment = async (req, res) => {
    try {
        const { fileUrl } = req.body;
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Check if the student has already submitted. If so, update it. If not, push a new submission.
        const existingSubIndex = assignment.submissions.findIndex(s => s.student.toString() === req.user._id.toString());
        
        if (existingSubIndex > -1) {
            assignment.submissions[existingSubIndex].fileUrl = fileUrl;
            assignment.submissions[existingSubIndex].submittedAt = Date.now();
        } else {
            assignment.submissions.push({ student: req.user._id, fileUrl });
        }

        await assignment.save();
        res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
exports.deleteAssignment = async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};