const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Note: In production, hash this with bcrypt!
    role: { type: String, default: 'citizen' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);