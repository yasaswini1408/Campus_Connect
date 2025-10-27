const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    regNo: {                  // Use registration number instead of email
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty','admin'],
        default: 'student'
    }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
