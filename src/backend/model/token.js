const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: '1h' } // Token expires in 1 hour
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
