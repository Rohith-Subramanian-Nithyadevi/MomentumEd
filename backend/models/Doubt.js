const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
    // Tie the doubt directly to the classroom and the specific subject
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
    subjectFolder: { type: String, required: true }, 
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    referenceUrl: { type: String, default: '' }, // NEW: Link for image/solution references
    
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    answers: [{
        text: { type: String, required: true },
        referenceUrl: { type: String, default: '' }, // NEW: Link for answer references
        answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);