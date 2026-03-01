const Doubt = require('../models/Doubt');

// @desc    Get doubts for a specific class and subject
// @route   GET /api/doubts/:classId/:subjectFolder
exports.getDoubtsBySubject = async (req, res) => {
    try {
        const { classId, subjectFolder } = req.params;
        const doubts = await Doubt.find({ classGroup: classId, subjectFolder })
            .populate('postedBy', 'name role')
            .populate('answers.answeredBy', 'name role')
            .populate('answers.replies.repliedBy', 'name role')
            .sort({ createdAt: -1 }); // Newest first
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new doubt inside a subject folder
// @route   POST /api/doubts
exports.createDoubt = async (req, res) => {
    try {
        const { classId, subjectFolder, title, description, referenceUrl } = req.body;
        const doubt = await Doubt.create({
            classGroup: classId,
            subjectFolder,
            title,
            description,
            referenceUrl, // NEW: Link for image/solution references
            postedBy: req.user._id
        });
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Answer a doubt
// @route   POST /api/doubts/:id/answers
exports.answerDoubt = async (req, res) => {
    try {
        const { text, referenceUrl } = req.body;
        const doubt = await Doubt.findById(req.params.id);
        
        if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

        doubt.answers.push({
            text,
            referenceUrl, // NEW: Link for answer references
            answeredBy: req.user._id
        });

        await doubt.save();
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Add this line to your existing getDoubtsBySubject function to load reply names:
// .populate('answers.replies.repliedBy', 'name role') 

// @desc    Add a reply to a specific answer
// @route   POST /api/doubts/:doubtId/answers/:answerId/replies
exports.replyToAnswer = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.doubtId);
        const answer = doubt.answers.id(req.params.answerId);
        answer.replies.push({ text: req.body.text, repliedBy: req.user._id });
        await doubt.save();
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a doubt
// @route   DELETE /api/doubts/:id
exports.deleteDoubt = async (req, res) => {
    try {
        const deletedDoubt = await Doubt.findByIdAndDelete(req.params.id);
        if (!deletedDoubt) return res.status(404).json({ message: 'Doubt not found' });
        res.json({ message: 'Doubt deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an answer
// @route   DELETE /api/doubts/:doubtId/answers/:answerId
exports.deleteAnswer = async (req, res) => {
    try {
        // Using $pull is the safest way to remove an item from a MongoDB array
        const updatedDoubt = await Doubt.findByIdAndUpdate(
            req.params.doubtId,
            { $pull: { answers: { _id: req.params.answerId } } },
            { new: true }
        );
        if (!updatedDoubt) return res.status(404).json({ message: 'Doubt not found' });
        
        res.json({ message: 'Answer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};