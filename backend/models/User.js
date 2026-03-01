const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'advisor', 'admin'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup' }],
    
    // --- NEW PROFILE FIELDS ---
    dob: { type: Date },
    rollNo: { type: String }, // Roll No for students, ID for faculty
    age: { type: Number },
    phone: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    fatherName: { type: String },
    motherName: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);