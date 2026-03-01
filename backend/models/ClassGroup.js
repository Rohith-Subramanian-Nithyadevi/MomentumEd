const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema({
    className: { type: String, required: true },
    subject: { type: String, required: true },
    groupCode: { type: String, required: true, unique: true }, // The 6-digit join code
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Teachers who joined
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Students who joined
    timetableUrl: { type: String, default: '' }, // URL for the uploaded timetable file
    materials: [{
        title: String,
        fileUrl: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('ClassGroup', classGroupSchema);