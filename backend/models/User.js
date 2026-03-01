const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' }
}, { timestamps: true });

// Hash password before saving
// Hash password before saving (Modern Mongoose v9+ pattern)
userSchema.pre('save', async function() {
    // If the password wasn't changed, just return and do nothing
    if (!this.isModified('password')) return; 
    
    // Otherwise, hash the new password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);