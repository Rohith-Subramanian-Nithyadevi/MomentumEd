const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    subjectFolder: { type: String, required: true }, 
    title: { type: String, required: true },
    description: { type: String, required: true },
    referenceUrl: { type: String, default: '' }, // For worksheet links
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Track which students submitted
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileUrl: { type: String, required: true }, // Link to their completed work
        submittedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);