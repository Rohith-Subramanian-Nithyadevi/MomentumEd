const Doubt = require('../models/Doubt');

// @desc    Create a new doubt
// @route   POST /api/doubts
// @access  Private
exports.createDoubt = async (req, res) => {
    try {
        const { title, description } = req.body;
        const doubt = await Doubt.create({
            title,
            description,
            postedBy: req.user._id
        });
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all doubts
// @route   GET /api/doubts
// @access  Private
exports.getDoubts = async (req, res) => {
    try {
        // Populate replaces the user ID with the actual user name and role
        const doubts = await Doubt.find()
            .populate('postedBy', 'name role')
            .populate('answers.answeredBy', 'name role')
            .sort({ createdAt: -1 }); // Newest first
        res.status(200).json(doubts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Answer a doubt
// @route   POST /api/doubts/:id/answers
// @access  Private (Teachers only ideally, but we'll allow all for now)
exports.answerDoubt = async (req, res) => {
    try {
        const { text } = req.body;
        const doubt = await Doubt.findById(req.params.id);

        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found' });
        }

        const answer = {
            text,
            answeredBy: req.user._id
        };

        doubt.answers.push(answer);
        await doubt.save();

        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};