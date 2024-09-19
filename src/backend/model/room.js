const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  creator: { type: String, required: true },
  users: [ String ],
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;  // Export the Room model
