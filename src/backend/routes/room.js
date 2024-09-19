const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Room = require('../model/room');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', async (req, res) => {
  const roomCode = crypto.randomBytes(4).toString('hex');
  const { creator } = req.body;  // The user creating the room

  try {
    if (!creator) {
      return res.status(400).json({ message: 'Creator name is required' });
    }

    const newRoom = new Room({ roomCode, creator });
    await newRoom.save();

    res.json({ roomCode: newRoom.roomCode });
  } catch (err) {
    console.error('Error creating room:', err);  // Log the error for debugging
    res.status(500).json({ message: 'Error creating room' });
  }
});


// Invite friends endpoint
router.post('/invite', (req, res) => {
  const { email, roomCode } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'You are invited to a room!',
    text: `Join the room with the code: ${roomCode}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Error sending email' });
    }
    res.json({ message: 'Invite sent!' });
  });
});

// Join a room
router.post('/joinRoom', authenticateToken, async (req, res) => {
  const { roomCode } = req.body;
  const user = req.user;  // The authenticated user information

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.users.includes(user.username)) {  // Use username instead of user ID
      room.users.push(user.username);
      await room.save();
    }

    res.json({ message: 'User added to room' });
  } catch (err) {
    return res.status(500).json({ message: 'Error joining room' });
  }
});

// Get room users
router.get('/room/:roomCode/users', async (req, res) => {
  const { roomCode } = req.params;
  const { userId } = req.query;  // The ID of the user making the request

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only the room creator can access the users list
    if (room.creator !== userId) {
      return res.status(403).json({ message: 'Access denied. Only the room creator can view the user list.' });
    }

    res.status(200).json({ users: room.users });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching users list' });
  }
});

// Validate room code
router.post('/validateRoom', async (req, res) => {
  const roomCode = req.body.roomCode;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.json({ message: 'Room exists' });
  } catch (err) {
    return res.status(500).json({ message: 'Error validating room' });
  }
});

module.exports = router;
