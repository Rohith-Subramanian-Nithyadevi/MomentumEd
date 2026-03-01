const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema({
    className: { type: String, required: true },
    groupCode: { type: String, required: true, unique: true },
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // UPDATED: Teachers now create a "Folder" when they join
    teachers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        subjectName: { type: String, required: true } // e.g., "Data Structures", "Java"
    }],
    
    // Remove timetableUrl: { type: String } and add this:
    timetableData: { type: Object, default: null },
    
    // UPDATED: Materials now belong to a specific teacher's folder
    materials: [{
        title: String,
        fileUrl: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        folderSubject: { type: String, required: true }, // Links to the teacher's subjectName
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('ClassGroup', classGroupSchema);