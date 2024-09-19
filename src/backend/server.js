const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const uploadRoute = require('./routes/upload');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const roomRoute = require('./routes/room'); // Import room routes
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/idps')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Use routes
app.use('/api', uploadRoute);
app.use('/api/auth', authRoutes);
app.use('/api/adm', adminRoutes);
app.use('/api/room', roomRoute); // Use the room routes

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
